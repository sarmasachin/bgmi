/**
 * E2E: BGMI / PUBG / Lite redeem date pickers (save ISO → public labels).
 * Run: npx tsx scripts/e2e-lite-redeem-schedule.mjs
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

const read = (p) => fs.readFileSync(resolve(p), "utf8");
const schedule = await load("src/lib/redeemCodeSchedule.ts");
const {
  joinRedeemScheduleIso,
  isRedeemCodePubliclyLive,
  isRedeemCodeScheduled,
  formatRedeemReleasedLabel,
  formatRedeemExpiresLabel,
  formatRedeemExpiredOnLabel,
} = schedule;

function htmlShowsCodeCard(html, code) {
  return html.includes(`>${code}</code>`);
}

function isIstDateLabel(prefix, label) {
  return new RegExp(
    `^${prefix}: \\d{1,2} [A-Za-z]{3,}, \\d{1,2}:\\d{2} (am|pm) IST$`,
    "i",
  ).test(label || "");
}

const past = joinRedeemScheduleIso("2026-08-01", "12:00");
const futureGoLive = joinRedeemScheduleIso("2099-06-01", "10:00");
const futureExpire = joinRedeemScheduleIso("2099-06-02", "18:00");
const now = Date.parse("2026-08-31T20:30:00+05:30");

function samplePage(path, extra = {}) {
  return {
    title: "t",
    intro: "i",
    sectionHeading: "s",
    archiveHeading: "a",
    closing: "c",
    seoTitle: "st",
    seoDescription: "sd",
    seoKeywords: ["k"],
    path,
    codes: [
      {
        id: "sched",
        title: "Scheduled",
        code: "SCH1",
        status: "live",
        releasedAt: futureGoLive,
        expiresAt: futureExpire,
      },
      {
        id: "active",
        title: "Active",
        code: "ACT1",
        status: "live",
        releasedAt: past,
        expiresAt: futureExpire,
      },
    ],
    faqs: [],
    ui: {},
    ...extra,
  };
}

console.log("\n== A) Admin date pickers on all 4 families ==");
{
  const mgr = read("app/admin/redeem-shared/AdminLiteRedeemCodesManager.tsx");
  const fields = read("app/admin/redeem-shared/AdminRedeemCodeScheduleFields.tsx");
  ok("shared manager uses schedule fields", mgr.includes("AdminRedeemCodeScheduleFields"));
  ok("shared manager hydrates on edit", mgr.includes("hydrateRedeemScheduleForEdit"));
  ok("shared manager finalizes on add", mgr.includes("finalizeRedeemScheduleDraft"));
  ok("date input exists", fields.includes('type="date"') && fields.includes('type="time"'));
  ok("IST date labels", fields.includes("Date (IST)") && fields.includes("Time (IST)"));
  ok("no text-only Released label field", !mgr.includes("Released label"));
  ok("Add code does not auto-fill dates", !mgr.includes("defaultLiveRedeemSchedule"));

  for (const [name, file] of [
    ["BGMI", "app/admin/bgmi-redeem/AdminBgmiRedeemForm.tsx"],
    ["PUBG", "app/admin/pubg-redeem/AdminPubgRedeemForm.tsx"],
    ["BGMI Air", "app/admin/bgmi-lite-redeem/AdminBgmiLiteRedeemForm.tsx"],
    ["PUBG Flash", "app/admin/pubg-mobile-lite-redeem/AdminPubgMobileLiteRedeemForm.tsx"],
    ["FF", "app/admin/free-fire-redeem/AdminFreeFireRedeemCodesSection.tsx"],
  ]) {
    const src = read(file);
    const wired =
      src.includes("AdminLiteRedeemCodesManager") || src.includes("AdminRedeemCodeScheduleFields");
    ok(`${name} add/edit modal has date schedule`, wired);
  }
}

console.log("\n== B) Repo persist ISO ==");
{
  const bgmi = await load("src/server/repositories/bgmiRedeemCodesRepository.ts");
  const pubg = await load("src/server/repositories/pubgRedeemCodesRepository.ts");
  const bgmiLite = await load("src/server/repositories/bgmiLiteRedeemCodesRepository.ts");
  const pubgLite = await load("src/server/repositories/pubgMobileLiteRedeemCodesRepository.ts");

  const pages = [
    ["BGMI", bgmi.normalizeBgmiRedeemPage(samplePage("/bgmi-redeem-code"))],
    ["PUBG", pubg.normalizePubgRedeemPage(samplePage("/pubg-redeem-code"))],
    ["BGMI Air", bgmiLite.normalizeBgmiLiteRedeemPage(samplePage("/bgmi-lite-redeem-code"))],
    [
      "PUBG Flash",
      pubgLite.normalizePubgMobileLiteRedeemPage(samplePage("/pubg-mobile-lite-redeem-code")),
    ],
  ];

  for (const [name, page] of pages) {
    const sched = page.codes.find((c) => c.id === "sched");
    const active = page.codes.find((c) => c.id === "active");
    ok(`${name}: releasedAt persisted`, sched?.releasedAt === futureGoLive);
    ok(`${name}: expiresAt persisted`, sched?.expiresAt === futureExpire);
    ok(`${name}: released label from ISO`, sched?.releasedLabel === formatRedeemReleasedLabel(futureGoLive));
    ok(`${name}: Released date format`, isIstDateLabel("Released", sched?.releasedLabel));
    ok(`${name}: Expires date format`, isIstDateLabel("Expires", sched?.expiresLabel));
    ok(`${name}: scheduled not public`, !isRedeemCodePubliclyLive(sched, now));
    ok(`${name}: scheduled flag`, isRedeemCodeScheduled(sched, now));
    ok(`${name}: active is public`, isRedeemCodePubliclyLive(active, now));
  }
}

console.log("\n== C) Line limits ==");
{
  for (const f of [
    "app/admin/redeem-shared/AdminLiteRedeemCodesManager.tsx",
    "app/admin/redeem-shared/AdminRedeemCodeScheduleFields.tsx",
    "src/components/BgmiRedeemCodeLandingPage.tsx",
    "src/components/PubgRedeemCodeLandingPage.tsx",
    "src/components/BgmiLiteRedeemCodeLandingPage.tsx",
    "src/components/PubgMobileLiteRedeemCodeLandingPage.tsx",
    "src/server/repositories/bgmiRedeemCodesRepository.ts",
  ]) {
    const n = read(f).split(/\r?\n/).length;
    ok(`${f} ≤400`, n <= 400, `${n} lines`);
  }
}

console.log("\n== D) HTTP smoke ==");
for (const path of [
  "/bgmi-redeem-code",
  "/pubg-redeem-code",
  "/bgmi-lite-redeem-code",
  "/pubg-mobile-lite-redeem-code",
  "/free-fire-redeem-code",
  "/admin/bgmi-redeem",
  "/admin/pubg-redeem",
  "/admin/bgmi-lite-redeem",
  "/admin/pubg-mobile-lite-redeem",
  "/admin/free-fire-redeem",
]) {
  try {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual", signal: AbortSignal.timeout(20000) });
    const okStatus = path.startsWith("/admin")
      ? res.status === 200 || res.status === 307 || res.status === 302
      : res.status === 200;
    ok(`${path} reachable`, okStatus, `status=${res.status}`);
    if (!path.startsWith("/admin") && res.status === 200) {
      const html = await res.text();
      ok(`${path} no crash`, !html.includes("Application error") && !html.includes("Internal Server Error"));
    }
  } catch (e) {
    ok(`${path} fetch`, false, String(e.message || e));
  }
}

console.log("\n== E) Save ISO → public date format (restore after) ==");
{
  const bgmiRepo = await load("src/server/repositories/bgmiRedeemCodesRepository.ts");
  const pubgRepo = await load("src/server/repositories/pubgRedeemCodesRepository.ts");
  const bgmiLiteRepo = await load("src/server/repositories/bgmiLiteRedeemCodesRepository.ts");
  const pubgLiteRepo = await load("src/server/repositories/pubgMobileLiteRedeemCodesRepository.ts");
  const ffRepo = await load("src/server/repositories/freeFireRedeemCodesRepository.ts");
  const ffMaxRepo = await load("src/server/repositories/freeFireMaxRedeemCodesRepository.ts");

  const releasedAt = joinRedeemScheduleIso("2026-09-10", "10:00");
  const expiresAt = joinRedeemScheduleIso("2026-09-25", "23:59");
  const releasedLabel = formatRedeemReleasedLabel(releasedAt);
  const expiresLabel = formatRedeemExpiresLabel(expiresAt);
  ok("Released format", isIstDateLabel("Released", releasedLabel), releasedLabel);
  ok("Expires format", isIstDateLabel("Expires", expiresLabel), expiresLabel);
  ok("Expired-on format", isIstDateLabel("Expired on", formatRedeemExpiredOnLabel(releasedAt)));

  const families = [
    {
      name: "BGMI",
      path: "/bgmi-redeem-code",
      before: await bgmiRepo.getBgmiRedeemPageForAdmin(),
      save: (page) => bgmiRepo.saveBgmiRedeemPage(page),
      clear: () => bgmiRepo.clearBgmiRedeemPage(),
    },
    {
      name: "PUBG",
      path: "/pubg-redeem-code",
      before: await pubgRepo.getPubgRedeemPageForAdmin(),
      save: (page) => pubgRepo.savePubgRedeemPage(page),
      clear: () => pubgRepo.clearPubgRedeemPage(),
    },
    {
      name: "BGMI Air",
      path: "/bgmi-lite-redeem-code",
      before: await bgmiLiteRepo.getBgmiLiteRedeemPageForAdmin(),
      save: (page) => bgmiLiteRepo.saveBgmiLiteRedeemPage(page),
      clear: () => bgmiLiteRepo.clearBgmiLiteRedeemPage(),
    },
    {
      name: "PUBG Flash",
      path: "/pubg-mobile-lite-redeem-code",
      before: await pubgLiteRepo.getPubgMobileLiteRedeemPageForAdmin(),
      save: (page) => pubgLiteRepo.savePubgMobileLiteRedeemPage(page),
      clear: () => pubgLiteRepo.clearPubgMobileLiteRedeemPage(),
    },
    {
      name: "FF",
      path: "/free-fire-redeem-code",
      before: await ffRepo.getFreeFireRedeemPageForAdmin(),
      save: (page) => ffRepo.saveFreeFireRedeemPage(page),
      clear: () => ffRepo.clearFreeFireRedeemPage(),
      extra: { server: "global" },
    },
    {
      name: "FF Max",
      path: "/free-fire-max-redeem-code",
      before: await ffMaxRepo.getFreeFireMaxRedeemPageForAdmin(),
      save: (page) => ffMaxRepo.saveFreeFireMaxRedeemPage(page),
      clear: () => ffMaxRepo.clearFreeFireMaxRedeemPage(),
      extra: { server: "global" },
    },
  ];

  for (const fam of families) {
    const marker = `E2EDATE${fam.name.replace(/\s+/g, "")}`;
    const hidden = `${marker}HIDE`;
    try {
      const page = {
        ...fam.before.page,
        codes: [
          {
            id: `${marker}-live`,
            title: `${marker} Live`,
            code: marker,
            status: "live",
            releasedAt,
            expiresAt,
            ...(fam.extra || {}),
          },
          {
            id: `${marker}-sched`,
            title: `${marker} Hidden`,
            code: hidden,
            status: "live",
            releasedAt: futureGoLive,
            expiresAt: futureExpire,
            ...(fam.extra || {}),
          },
        ],
      };
      const saved = await fam.save(page);
      const live = saved.page.codes.find((c) => c.code === marker);
      ok(`${fam.name}: saved ISO`, live?.releasedAt === releasedAt && live?.expiresAt === expiresAt);
      ok(`${fam.name}: saved date labels`, live?.releasedLabel === releasedLabel && live?.expiresLabel === expiresLabel);

      const res = await fetch(`${BASE}${fam.path}`, { cache: "no-store", signal: AbortSignal.timeout(25000) });
      const html = await res.text();
      ok(`${fam.name}: public 200`, res.status === 200);
      ok(`${fam.name}: public shows live code`, htmlShowsCodeCard(html, marker));
      ok(`${fam.name}: public Released date`, html.includes(releasedLabel));
      ok(`${fam.name}: public Expires date`, html.includes(expiresLabel));
      ok(`${fam.name}: scheduled code not on card`, !htmlShowsCodeCard(html, hidden));
    } catch (e) {
      ok(`${fam.name}: roundtrip`, false, String(e.message || e));
    } finally {
      try {
        if (fam.before.usingDefault) await fam.clear();
        else await fam.save(fam.before.page);
      } catch (e) {
        ok(`${fam.name}: restore`, false, String(e.message || e));
      }
    }
  }

  {
    const marker = "E2ENODATEBGMI";
    const before = await bgmiRepo.getBgmiRedeemPageForAdmin();
    try {
      await bgmiRepo.saveBgmiRedeemPage({
        ...before.page,
        codes: [{ id: marker, title: "No Date Code", code: marker, status: "live" }],
      });
      const res = await fetch(`${BASE}/bgmi-redeem-code`, {
        cache: "no-store",
        signal: AbortSignal.timeout(25000),
      });
      const html = await res.text();
      const idx = html.indexOf(`>${marker}</code>`);
      const slice = idx >= 0 ? html.slice(idx, idx + 900) : "";
      ok("no-date code visible", htmlShowsCodeCard(html, marker));
      ok("no-date card hides Released text", !slice.includes("Released:"));
      ok("no-date card hides Expires text", !slice.includes("Expires:"));
    } catch (e) {
      ok("no-date roundtrip", false, String(e.message || e));
    } finally {
      if (before.usingDefault) await bgmiRepo.clearBgmiRedeemPage();
      else await bgmiRepo.saveBgmiRedeemPage(before.page);
    }
  }
}

console.log("\n== Summary ==");
if (failures.length) {
  console.log(`FAILED (${failures.length}):`);
  for (const f of failures) console.log(" -", f);
  process.exit(1);
}
console.log("ALL CHECKS PASSED — date pickers on BGMI/PUBG/Lite + FF");
process.exit(0);
