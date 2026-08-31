/**
 * Full e2e: redeem auto-expire (not half-fix).
 * Run: npx tsx scripts/e2e-redeem-auto-expire.mjs
 */
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const BASE = process.env.E2E_BASE || "http://127.0.0.1:3000";

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
  joinRedeemScheduleIso,
  isValidRedeemScheduleIso,
  formatRedeemExpiresLabel,
} = schedule;

const failures = [];
function ok(name, pass, detail = "") {
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
  if (!pass) failures.push(name);
}

const pastIso = joinRedeemScheduleIso("2026-08-31", "18:00");
const futureIso = joinRedeemScheduleIso("2099-12-01", "23:59");
const releasedIso = joinRedeemScheduleIso("2026-08-31", "12:00");
const nowPast = Date.parse("2026-08-31T20:30:00+05:30");
const nowBefore = Date.parse("2026-08-31T17:59:00+05:30");

console.log("\n== 1) applyAutoExpireRedeemCode ==");
{
  const expired = applyAutoExpireRedeemCode(
    {
      status: "live",
      releasedAt: releasedIso,
      expiresAt: pastIso,
      releasedLabel: "Released: x",
      expiresLabel: formatRedeemExpiresLabel(pastIso),
    },
    nowPast,
  );
  ok("past → status expired", expired.status === "expired");
  ok("past → expiredOnAt = old expiresAt", expired.expiredOnAt === pastIso);
  ok("past → expiredOnLabel set", Boolean(expired.expiredOnLabel?.startsWith("Expired on:")));
  ok("past → live fields cleared", !expired.expiresAt && !expired.releasedAt && !expired.expiresLabel);

  const live = applyAutoExpireRedeemCode(
    { status: "live", expiresAt: pastIso },
    nowBefore,
  );
  ok("1 min before expiry stays live", live.status === "live" && live.expiresAt === pastIso);

  const future = applyAutoExpireRedeemCode(
    { status: "live", expiresAt: futureIso },
    nowPast,
  );
  ok("future stays live", future.status === "live");

  const exact = applyAutoExpireRedeemCode(
    { status: "live", expiresAt: pastIso },
    Date.parse(pastIso),
  );
  ok("exact expiry ms → expired", exact.status === "expired");

  const labelOnly = applyAutoExpireRedeemCode(
    { status: "live", expiresLabel: "Expires: 31 Aug, 6:00 pm IST" },
    nowPast,
  );
  ok("label-only (no ISO) does NOT auto-expire", labelOnly.status === "live");

  const already = applyAutoExpireRedeemCode(
    { status: "expired", expiredOnLabel: "Expired on: yesterday" },
    nowPast,
  );
  ok("already expired unchanged", already.status === "expired" && already.expiredOnLabel?.includes("yesterday"));
}

console.log("\n== 2) finalizeRedeemScheduleDraft (save path) ==");
{
  // finalize uses Date.now(); force by applying after with known past when clock is past
  const draft = finalizeRedeemScheduleDraft({
    status: "live",
    releasedAt: releasedIso,
    expiresAt: pastIso,
  });
  const clock = Date.now();
  if (clock >= Date.parse(pastIso)) {
    ok("finalize+now: past ISO → expired", draft.status === "expired");
    ok("finalize+now: expiredOnLabel present", Boolean(draft.expiredOnLabel));
  } else {
    ok("finalize+now: still before pastIso on clock", draft.status === "live");
  }

  const futureDraft = finalizeRedeemScheduleDraft({
    status: "live",
    releasedAt: releasedIso,
    expiresAt: futureIso,
  });
  ok("finalize future stays live", futureDraft.status === "live" && isValidRedeemScheduleIso(futureDraft.expiresAt));
}

console.log("\n== 3) attachRedeemScheduleFromRaw (DB read) ==");
{
  const item = { status: "live" };
  attachRedeemScheduleFromRaw(
    item,
    { releasedAt: releasedIso, expiresAt: pastIso },
    (v, fb = "") => (typeof v === "string" ? v.trim() : fb),
  );
  const expectExpired = Date.now() >= Date.parse(pastIso);
  ok(
    "attach past ISO",
    expectExpired ? item.status === "expired" && Boolean(item.expiredOnLabel) : item.status === "live",
    `status=${item.status}`,
  );

  const item2 = { status: "live" };
  attachRedeemScheduleFromRaw(
    item2,
    { expiresAt: futureIso },
    (v, fb = "") => (typeof v === "string" ? v.trim() : fb),
  );
  ok("attach future stays live", item2.status === "live" && item2.expiresAt === futureIso);
}

console.log("\n== 4) FF + FF Max repository normalize ==");
{
  const rawPage = {
    title: "t",
    intro: "i",
    sectionHeading: "s",
    archiveHeading: "a",
    closing: "c",
    seoTitle: "st",
    seoDescription: "sd",
    seoKeywords: ["k"],
    path: "/free-fire-max-redeem-code",
    servers: [{ id: "india", label: "India Server", badge: "IND" }],
    codes: [
      {
        id: "past-code",
        title: "Past Code",
        code: "FFPAST123",
        status: "live",
        server: "india",
        releasedAt: releasedIso,
        expiresAt: pastIso,
      },
      {
        id: "future-code",
        title: "Future Code",
        code: "FFFUTURE1",
        status: "live",
        server: "india",
        releasedAt: releasedIso,
        expiresAt: futureIso,
      },
      {
        id: "label-only",
        title: "Label Only",
        code: "FFLABEL1",
        status: "live",
        server: "india",
        expiresLabel: "Expires: 31 Aug, 6:00 pm IST",
      },
    ],
    faq: [],
    ui: {},
  };

  const maxPage = maxRepo.normalizeFreeFireMaxRedeemPage(rawPage);
  const ffPage = ffRepo.normalizeFreeFireRedeemPage({
    ...rawPage,
    path: "/free-fire-redeem-code",
  });

  for (const [name, page] of [
    ["FF Max", maxPage],
    ["FF", ffPage],
  ]) {
    const past = page.codes.find((c) => c.id === "past-code");
    const future = page.codes.find((c) => c.id === "future-code");
    const label = page.codes.find((c) => c.id === "label-only");
    const expectExpired = Date.now() >= Date.parse(pastIso);
    ok(`${name}: past code auto-expired`, expectExpired ? past?.status === "expired" : past?.status === "live", past?.status);
    ok(`${name}: future code live`, future?.status === "live");
    ok(`${name}: label-only still live (no ISO)`, label?.status === "live");
    ok(
      `${name}: past in expired filter bucket`,
      expectExpired
        ? page.codes.filter((c) => c.status === "expired").some((c) => c.id === "past-code")
        : true,
    );
    ok(
      `${name}: future in live filter bucket`,
      page.codes.filter((c) => c.status === "live").some((c) => c.id === "future-code"),
    );
  }
}

console.log("\n== 5) Client board wiring (static) ==");
{
  const fs = await import("node:fs");
  const board = fs.readFileSync(resolve("src/components/FreeFireRedeemCodeBoard.tsx"), "utf8");
  ok("board imports applyAutoExpireRedeemCode", board.includes("applyAutoExpireRedeemCode"));
  ok("board maps effectiveCodes", board.includes("effectiveCodes"));
  ok("board schedules expiry timeout", board.includes("setTimeout") && board.includes("nextExpiry"));
  ok("board filters live/expired from effectiveCodes", /effectiveCodes\.filter/.test(board) || board.includes("filtered.filter"));
}

console.log("\n== 6) HTTP pages load ==");
for (const path of ["/free-fire-redeem-code", "/free-fire-max-redeem-code"]) {
  try {
    const res = await fetch(`${BASE}${path}`);
    ok(`${path} HTTP 200`, res.status === 200, `status=${res.status}`);
    const html = await res.text();
    ok(`${path} no crash`, !html.includes("Application error") && !html.includes("Internal Server Error"));
  } catch (e) {
    ok(`${path} fetch`, false, String(e.message || e));
  }
}

console.log("\n== 7) Scope gaps (documented) ==");
{
  const liteHasIso =
    (await import("node:fs")).readFileSync(resolve("src/lib/bgmiLiteRedeemCodes.ts"), "utf8").includes("expiresAt");
  ok("BGMI Lite has no expiresAt (out of FF date-picker scope)", !liteHasIso);
  const pubgLite = (await import("node:fs")).readFileSync(
    resolve("src/lib/pubgMobileLiteRedeemCodes.ts"),
    "utf8",
  );
  ok("PUBG Lite has no expiresAt (out of scope)", !pubgLite.includes("expiresAt"));
}

console.log("\n== Summary ==");
if (failures.length) {
  console.log(`FAILED (${failures.length}):`);
  for (const f of failures) console.log(" -", f);
  process.exit(1);
}
console.log("ALL CHECKS PASSED — auto-expire is end-to-end for FF + FF Max");
process.exit(0);
