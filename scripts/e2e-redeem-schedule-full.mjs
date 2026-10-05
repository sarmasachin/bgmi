/**
 * Full e2e: redeem schedule on edit + go-live + auto-expire (no half-fix).
 * Run: npx tsx scripts/e2e-redeem-schedule-full.mjs
 */
import fs from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const BASE = process.env.E2E_BASE || "http://127.0.0.1:3000";
const failures = [];

function ok(name, pass, detail = "") {
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
  if (!pass) failures.push(name);
}

async function load(rel) {
  try {
    return await import(pathToFileURL(resolve(rel)).href);
  } catch {
    require("tsx/cjs");
    return require(resolve(rel));
  }
}

const schedule = await load("src/lib/redeemCodeSchedule.ts");
const ffRepo = await load("src/server/repositories/freeFireRedeemCodesRepository.ts");
const maxRepo = await load("src/server/repositories/freeFireMaxRedeemCodesRepository.ts");

const {
  applyAutoExpireRedeemCode,
  finalizeRedeemScheduleDraft,
  attachRedeemScheduleFromRaw,
  hydrateRedeemScheduleForEdit,
  isRedeemCodeScheduled,
  isRedeemCodePubliclyLive,
  joinRedeemScheduleIso,
  isValidRedeemScheduleIso,
  formatRedeemReleasedLabel,
  formatRedeemExpiresLabel,
} = schedule;

const read = (p) => fs.readFileSync(resolve(p), "utf8");

const past = joinRedeemScheduleIso("2026-08-01", "12:00");
const mid = joinRedeemScheduleIso("2026-08-31", "12:00");
const futureGoLive = joinRedeemScheduleIso("2099-06-01", "10:00");
const futureExpire = joinRedeemScheduleIso("2099-06-02", "18:00");
const now = Date.parse("2026-08-31T20:30:00+05:30");

console.log("\n== A) Schedule helpers ==");
{
  const scheduled = {
    status: "live",
    releasedAt: futureGoLive,
    expiresAt: futureExpire,
  };
  ok("future go-live → scheduled", isRedeemCodeScheduled(scheduled, now) === true);
  ok("scheduled NOT publicly live", isRedeemCodePubliclyLive(scheduled, now) === false);

  const active = {
    status: "live",
    releasedAt: past,
    expiresAt: futureExpire,
  };
  ok("past go-live + future expire → publicly live", isRedeemCodePubliclyLive(active, now) === true);
  ok("active not scheduled", isRedeemCodeScheduled(active, now) === false);

  const expired = applyAutoExpireRedeemCode(
    { status: "live", releasedAt: past, expiresAt: mid },
    now,
  );
  ok("past expire → expired", expired.status === "expired");
  ok("expired not publicly live", isRedeemCodePubliclyLive(expired, now) === false);

  const exactGoLive = {
    status: "live",
    releasedAt: mid,
    expiresAt: futureExpire,
  };
  ok(
    "exact go-live ms → publicly live",
    isRedeemCodePubliclyLive(exactGoLive, Date.parse(mid)) === true,
  );

  const labelOnly = { status: "live", expiresLabel: "Expires: tomorrow" };
  ok("label-only stays publicly live (compat)", isRedeemCodePubliclyLive(labelOnly, now) === true);
  ok("label-only not scheduled", isRedeemCodeScheduled(labelOnly, now) === false);
}

console.log("\n== B) hydrateRedeemScheduleForEdit (update modal) ==");
{
  const bare = hydrateRedeemScheduleForEdit({ status: "live" });
  ok("bare live has no auto releasedAt", !isValidRedeemScheduleIso(bare.releasedAt));
  ok("bare live has no auto expiresAt", !isValidRedeemScheduleIso(bare.expiresAt));
  ok("bare live has no auto labels", !bare.releasedLabel && !bare.expiresLabel);

  const keep = hydrateRedeemScheduleForEdit({
    status: "live",
    releasedAt: futureGoLive,
    expiresAt: futureExpire,
  });
  ok("edit keeps existing go-live ISO", keep.releasedAt === futureGoLive);
  ok("edit keeps existing expire ISO", keep.expiresAt === futureExpire);
  ok(
    "edit refreshes labels from ISO",
    keep.releasedLabel === formatRedeemReleasedLabel(futureGoLive) &&
      keep.expiresLabel === formatRedeemExpiresLabel(futureExpire),
  );

  const expBare = hydrateRedeemScheduleForEdit({ status: "expired" });
  ok("bare expired has no auto expiredOnAt", !isValidRedeemScheduleIso(expBare.expiredOnAt));

  const expKeep = hydrateRedeemScheduleForEdit({
    status: "expired",
    expiredOnAt: mid,
  });
  ok("edit keeps expiredOnAt", expKeep.expiredOnAt === mid);
}

console.log("\n== C) finalize + attach (save/read) ==");
{
  const finalizedSched = finalizeRedeemScheduleDraft({
    status: "live",
    releasedAt: futureGoLive,
    expiresAt: futureExpire,
  });
  ok("finalize keeps future schedule live", finalizedSched.status === "live");
  ok("finalize keeps go-live ISO", finalizedSched.releasedAt === futureGoLive);

  const finalizedPast = finalizeRedeemScheduleDraft({
    status: "live",
    releasedAt: past,
    expiresAt: mid,
  });
  if (Date.now() >= Date.parse(mid)) {
    ok("finalize past expire → expired (clock)", finalizedPast.status === "expired");
  } else {
    ok("finalize before mid on clock", finalizedPast.status === "live");
  }

  const attached = { status: "live" };
  attachRedeemScheduleFromRaw(
    attached,
    { releasedAt: futureGoLive, expiresAt: futureExpire },
    (v, fb = "") => (typeof v === "string" ? v.trim() : fb),
  );
  ok("attach future stays live", attached.status === "live");
  ok("attach sets releasedAt", attached.releasedAt === futureGoLive);

  const finalizedEmpty = finalizeRedeemScheduleDraft({ status: "live", title: "n", code: "n" });
  ok("finalize without dates stays empty", !finalizedEmpty.releasedAt && !finalizedEmpty.expiresAt);
  ok("finalize without dates has no public labels", !finalizedEmpty.releasedLabel && !finalizedEmpty.expiresLabel);

  const finalizedPrefix = finalizeRedeemScheduleDraft({
    status: "live",
    releasedLabel: "Released: ",
    expiresLabel: "Expires:",
  });
  ok("prefix-only labels stripped", !finalizedPrefix.releasedLabel && !finalizedPrefix.expiresLabel);
}

console.log("\n== D) FF + FF Max normalize (repo) ==");
{
  const raw = {
    title: "t",
    intro: "i",
    sectionHeading: "s",
    archiveHeading: "a",
    closing: "c",
    seoTitle: "st",
    seoDescription: "sd",
    seoKeywords: ["k"],
    path: "/x",
    servers: [{ id: "global", label: "Global", badge: "Global" }],
    codes: [
      {
        id: "sched",
        title: "Scheduled",
        code: "SCH1",
        status: "live",
        server: "global",
        releasedAt: futureGoLive,
        expiresAt: futureExpire,
      },
      {
        id: "active",
        title: "Active",
        code: "ACT1",
        status: "live",
        server: "global",
        releasedAt: past,
        expiresAt: futureExpire,
      },
      {
        id: "old",
        title: "Old",
        code: "OLD1",
        status: "live",
        server: "global",
        releasedAt: past,
        expiresAt: mid,
      },
    ],
    faq: [],
    ui: {},
  };

  for (const [name, page] of [
    ["FF", ffRepo.normalizeFreeFireRedeemPage({ ...raw, path: "/free-fire-redeem-code" })],
    ["FF Max", maxRepo.normalizeFreeFireMaxRedeemPage({ ...raw, path: "/free-fire-max-redeem-code" })],
  ]) {
    const sched = page.codes.find((c) => c.id === "sched");
    const active = page.codes.find((c) => c.id === "active");
    const old = page.codes.find((c) => c.id === "old");
    ok(`${name}: scheduled still status live in DB view`, sched?.status === "live");
    ok(`${name}: scheduled not publicly live`, !isRedeemCodePubliclyLive(sched, now));
    ok(`${name}: active publicly live`, isRedeemCodePubliclyLive(active, now));
    const expectOldExpired = Date.now() >= Date.parse(mid);
    ok(
      `${name}: past expire auto-expired on read`,
      expectOldExpired ? old?.status === "expired" : old?.status === "live",
      old?.status,
    );
  }
}

console.log("\n== E) Admin + public wiring (source evidence) ==");
{
  const section = read("app/admin/free-fire-redeem/AdminFreeFireRedeemCodesSection.tsx");
  const fields = read("app/admin/redeem-shared/AdminRedeemCodeScheduleFields.tsx");
  const board = read("src/components/FreeFireRedeemCodeBoard.tsx");
  const landing = read("src/components/FreeFireRedeemCodeLandingPage.tsx");
  const maxPage = read("app/admin/free-fire-max-redeem/page.tsx");
  const ffPage = read("app/admin/free-fire-redeem/page.tsx");

  ok("edit openEdit uses hydrateRedeemScheduleForEdit", section.includes("hydrateRedeemScheduleForEdit"));
  ok("edit modal includes AdminRedeemCodeScheduleFields", section.includes("AdminRedeemCodeScheduleFields"));
  ok("admin shows SCHEDULED pill", section.includes("SCHEDULED") && section.includes("is-scheduled"));
  ok("status toggle uses hydrate for live", section.includes('status: "live"') && section.includes("hydrateRedeemScheduleForEdit"));
  ok("schedule section titled Schedule", fields.includes("Schedule") && fields.includes("Go live"));
  ok("schedule banner for future go-live", fields.includes("Scheduled — hidden"));
  ok("board uses isRedeemCodePubliclyLive", board.includes("isRedeemCodePubliclyLive"));
  ok("board wakes on releasedAt + expiresAt", board.includes("releasedAt") && board.includes("expiresAt"));
  ok("landing empty/live uses isRedeemCodePubliclyLive", landing.includes("isRedeemCodePubliclyLive"));

  const maxPageSrc = maxPage;
  const ffForm = read("app/admin/free-fire-redeem/AdminFreeFireRedeemForm.tsx");
  const ffClient = read("app/admin/free-fire-redeem/AdminFreeFireRedeemClient.tsx");
  ok(
    "FF Max admin page wires shared FF redeem client/form",
    /AdminFreeFireRedeemClient|from \"\.\.\/free-fire-redeem\/AdminFreeFireRedeemClient\"/.test(maxPageSrc),
  );
  ok(
    "shared form mounts CodesSection (edit+schedule)",
    ffForm.includes("AdminFreeFireRedeemCodesSection"),
  );
  ok("FF admin client exists", ffClient.includes("AdminFreeFireRedeemForm") || ffClient.includes("Save"));
  ok("FF admin save refreshes RSC so form is not stale", ffClient.includes("router.refresh()"));
  ok(
    "FF Max article draft key is separate from FF redeem",
    maxPageSrc.includes("bgmi_admin_ff_max_redeem_article_v1"),
  );
  ok("FF admin page exists", ffPage.length > 0);
}

console.log("\n== F) Line limits ==");
{
  for (const f of [
    "src/lib/redeemCodeSchedule.ts",
    "app/admin/free-fire-redeem/AdminFreeFireRedeemCodesSection.tsx",
    "app/admin/redeem-shared/AdminRedeemCodeScheduleFields.tsx",
    "app/admin/redeem-shared/AdminLiteRedeemCodesManager.tsx",
    "src/components/FreeFireRedeemCodeBoard.tsx",
  ]) {
    const n = read(f).split(/\r?\n/).length;
    ok(`${f} ≤400 lines`, n <= 400, `${n} lines`);
  }
}

console.log("\n== G) HTTP smoke ==");
for (const path of [
  "/free-fire-redeem-code",
  "/free-fire-max-redeem-code",
  "/bgmi-redeem-code",
  "/pubg-redeem-code",
  "/bgmi-lite-redeem-code",
  "/pubg-mobile-lite-redeem-code",
  "/admin/free-fire-redeem",
  "/admin/free-fire-max-redeem",
  "/admin/bgmi-redeem",
  "/admin/pubg-redeem",
  "/admin/bgmi-lite-redeem",
  "/admin/pubg-mobile-lite-redeem",
]) {
  try {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    const okStatus =
      path.startsWith("/admin")
        ? res.status === 200 || res.status === 307 || res.status === 302
        : res.status === 200;
    ok(`${path} reachable`, okStatus, `status=${res.status}`);
  } catch (e) {
    ok(`${path} fetch`, false, String(e.message || e));
  }
}

console.log("\n== H) BGMI / PUBG / Lite schedule wiring ==");
{
  const liteMgr = read("app/admin/redeem-shared/AdminLiteRedeemCodesManager.tsx");
  ok("Lite Add/Edit modal uses date schedule fields", liteMgr.includes("AdminRedeemCodeScheduleFields"));
  ok("Lite edit hydrates ISO for date pickers", liteMgr.includes("hydrateRedeemScheduleForEdit"));
  ok("Lite apply finalizes schedule ISO", liteMgr.includes("finalizeRedeemScheduleDraft"));
  ok("Lite admin shows SCHEDULED pill", liteMgr.includes("SCHEDULED") && liteMgr.includes("is-scheduled"));
  ok("Lite no longer uses plain Released label text fields", !liteMgr.includes("Released label"));

  for (const [name, file] of [
    ["BGMI", "src/server/repositories/bgmiRedeemCodesRepository.ts"],
    ["PUBG", "src/server/repositories/pubgRedeemCodesRepository.ts"],
    ["BGMI Lite", "src/server/repositories/bgmiLiteRedeemCodesRepository.ts"],
    ["PUBG Lite", "src/server/repositories/pubgMobileLiteRedeemCodesRepository.ts"],
  ]) {
    const src = read(file);
    ok(`${name} repo attaches schedule ISO`, src.includes("attachRedeemScheduleFromRaw"));
  }

  for (const [name, file] of [
    ["BGMI", "src/components/BgmiRedeemCodeLandingPage.tsx"],
    ["PUBG", "src/components/PubgRedeemCodeLandingPage.tsx"],
    ["BGMI Lite", "src/components/BgmiLiteRedeemCodeLandingPage.tsx"],
    ["PUBG Lite", "src/components/PubgMobileLiteRedeemCodeLandingPage.tsx"],
  ]) {
    const src = read(file);
    ok(`${name} public uses isRedeemCodePubliclyLive`, src.includes("isRedeemCodePubliclyLive"));
    ok(`${name} public auto-expires`, src.includes("applyAutoExpireRedeemCode"));
  }

  for (const [name, file] of [
    ["BGMI admin", "app/admin/bgmi-redeem/AdminBgmiRedeemForm.tsx"],
    ["PUBG admin", "app/admin/pubg-redeem/AdminPubgRedeemForm.tsx"],
    ["BGMI Lite admin", "app/admin/bgmi-lite-redeem/AdminBgmiLiteRedeemForm.tsx"],
    ["PUBG Lite admin", "app/admin/pubg-mobile-lite-redeem/AdminPubgMobileLiteRedeemForm.tsx"],
  ]) {
    ok(`${name} mounts shared date-picker manager`, read(file).includes("AdminLiteRedeemCodesManager"));
  }
}

console.log("\n== Summary ==");
if (failures.length) {
  console.log(`FAILED (${failures.length}):`);
  for (const f of failures) console.log(" -", f);
  process.exit(1);
}
console.log("ALL CHECKS PASSED — schedule fix for FF + BGMI/PUBG/Lite (edit + go-live + expire)");
process.exit(0);
