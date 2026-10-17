/**
 * E2E: “No new codes today” only when there are zero live codes.
 * Covers helper + BGMI/PUBG/Lite/FF public HTML. Restores DB after.
 * Run: E2E_BASE=http://127.0.0.1:3011 npx tsx scripts/e2e-redeem-freshness-banner.mjs
 */
import fs from "fs";
import path from "path";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

function loadDotEnv(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadDotEnv(".env");
loadDotEnv(".env.local");

const require = createRequire(import.meta.url);
const BASE = process.env.E2E_BASE || "http://127.0.0.1:3011";
const E2E_CODE = "E2EFRESHBANNER1";
const OLD_RELEASE = "2026-09-10T11:07:00+05:30";
const FUTURE_EXPIRE = "2099-12-31T23:59:00+05:30";

async function load(rel) {
  try {
    return await import(pathToFileURL(resolve(rel)).href);
  } catch {
    require("tsx/cjs");
    return require(resolve(rel));
  }
}

const failures = [];
function ok(name, pass, detail = "") {
  console.log(`[${pass ? "PASS" : "FAIL"}] ${name}${detail ? ` — ${detail}` : ""}`);
  if (!pass) failures.push(name);
}

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

async function fetchText(pathname) {
  const res = await fetch(`${BASE}${pathname}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(120000),
  });
  return { status: res.status, text: await res.text() };
}

function hasIdle(html) {
  return html.includes("lite-redeem-freshness--idle") && html.includes("No new codes today");
}
function hasOk(html) {
  return html.includes("lite-redeem-freshness--ok");
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const freshness = await load("src/lib/bgmiLiteRedeemFreshness.ts");
const {
  resolveRedeemFreshnessBanner,
  resolveRedeemFreshnessAt,
  istCalendarDayKey,
} = freshness;

const bgmiRepo = await load("src/server/repositories/bgmiRedeemCodesRepository.ts");
const bgmiPage = await load("src/lib/bgmiRedeemCodes.ts");
const pubgRepo = await load("src/server/repositories/pubgRedeemCodesRepository.ts");
const pubgPage = await load("src/lib/pubgRedeemCodes.ts");
const liteRepo = await load("src/server/repositories/bgmiLiteRedeemCodesRepository.ts");
const litePage = await load("src/lib/bgmiLiteRedeemCodes.ts");
const ffRepo = await load("src/server/repositories/freeFireRedeemCodesRepository.ts");
const ffPage = await load("src/lib/freeFireRedeemCodes.ts");

const beforeBgmi = await bgmiRepo.getBgmiRedeemPageForAdmin();
const beforePubg = await pubgRepo.getPubgRedeemPageForAdmin();
const beforeLite = await liteRepo.getBgmiLiteRedeemPageForAdmin();
const beforeFf = await ffRepo.getFreeFireRedeemPageForAdmin();

let restored = false;
async function restore() {
  if (restored) return;
  restored = true;
  if (beforeBgmi.usingDefault) await bgmiRepo.clearBgmiRedeemPage();
  else await bgmiRepo.saveBgmiRedeemPage(beforeBgmi.page);
  if (beforePubg.usingDefault) await pubgRepo.clearPubgRedeemPage();
  else await pubgRepo.savePubgRedeemPage(beforePubg.page);
  if (beforeLite.usingDefault) await liteRepo.clearBgmiLiteRedeemPage();
  else await liteRepo.saveBgmiLiteRedeemPage(beforeLite.page);
  if (beforeFf.usingDefault) await ffRepo.clearFreeFireRedeemPage();
  else await ffRepo.saveFreeFireRedeemPage(beforeFf.page);
}

function liveCode(overrides = {}) {
  return {
    id: "e2e-fresh-1",
    title: "E2E freshness live code",
    code: E2E_CODE,
    status: "live",
    releasedAt: OLD_RELEASE,
    expiresAt: FUTURE_EXPIRE,
    expiredOnAt: "",
    releasedLabel: "",
    expiresLabel: "",
    expiredOnLabel: "",
    ...overrides,
  };
}

try {
  console.log(`\nE2E_BASE=${BASE}`);

  console.log("\n== 1) Helper unit ==");
  {
    ok("live + not today → none", resolveRedeemFreshnessBanner(false, 2) === "none");
    ok("zero live → idle", resolveRedeemFreshnessBanner(false, 0) === "idle");
    ok("updated today → ok", resolveRedeemFreshnessBanner(true, 1) === "ok");
    ok("updated today + zero live → ok", resolveRedeemFreshnessBanner(true, 0) === "ok");

    const oldFresh = resolveRedeemFreshnessAt(null, [OLD_RELEASE], Date.parse("2026-09-12T12:00:00+05:30"));
    ok("old release not treated as today", oldFresh === null);

    const todayIso = `${istCalendarDayKey(new Date())}T10:00:00+05:30`;
    const todayFresh = resolveRedeemFreshnessAt(null, [todayIso]);
    ok("today release counts as fresh", Boolean(todayFresh));
  }

  console.log("\n== 2) BGMI redeem HTML ==");
  {
    await bgmiRepo.clearBgmiRedeemPage();
    const emptyHtml = await fetchText("/bgmi-redeem-code");
    ok("BGMI empty 200", emptyHtml.status === 200);
    ok("BGMI empty shows idle banner", hasIdle(emptyHtml.text));
    ok("BGMI empty no ok banner", !hasOk(emptyHtml.text));

    // Live codes from older day → idle must NOT show
    const withOldLive = bgmiPage.cloneBgmiRedeemPage();
    withOldLive.codes = [liveCode()];
    withOldLive.title = "E2E BGMI Redeem Freshness";
    await bgmiRepo.saveBgmiRedeemPage(withOldLive);

    const liveHtml = await fetchText("/bgmi-redeem-code");
    ok("BGMI live 200", liveHtml.status === 200);
    ok("BGMI live code visible", liveHtml.text.includes(E2E_CODE));
    ok("BGMI live hides idle banner", !hasIdle(liveHtml.text));
    ok(
      "BGMI live no idle banner class",
      !liveHtml.text.includes("lite-redeem-freshness--idle"),
    );

    // Released today → ok banner
    const todayIso = `${istCalendarDayKey(new Date())}T11:00:00+05:30`;
    const withToday = bgmiPage.cloneBgmiRedeemPage();
    withToday.codes = [liveCode({ releasedAt: todayIso, code: "E2EFRESHTODAY1" })];
    await bgmiRepo.saveBgmiRedeemPage(withToday);
    const todayHtml = await fetchText("/bgmi-redeem-code");
    ok("BGMI today shows ok banner", hasOk(todayHtml.text));
    ok("BGMI today hides idle", !hasIdle(todayHtml.text));
    ok("BGMI today code visible", todayHtml.text.includes("E2EFRESHTODAY1"));
  }

  console.log("\n== 3) PUBG + Lite + Free Fire (live old → no idle) ==");
  {
    const paths = [];

    {
      const page = pubgPage.clonePubgRedeemPage();
      page.codes = [liveCode({ id: "e2e-pubg-fresh", code: "E2EPUBGFRESH1" })];
      await pubgRepo.savePubgRedeemPage(page);
      paths.push(["/pubg-redeem-code", "E2EPUBGFRESH1", "PUBG"]);
    }
    {
      const page = litePage.cloneBgmiLiteRedeemPage();
      page.codes = [liveCode({ id: "e2e-lite-fresh", code: "E2ELITEFRESH1" })];
      await liteRepo.saveBgmiLiteRedeemPage(page);
      paths.push(["/bgmi-lite-redeem-code", "E2ELITEFRESH1", "BGMI Air"]);
    }
    {
      const page = ffPage.cloneFreeFireRedeemPage();
      page.codes = [liveCode({ id: "e2e-ff-fresh", code: "E2EFFFRESH1" })];
      await ffRepo.saveFreeFireRedeemPage(page);
      paths.push(["/free-fire-redeem-code", "E2EFFFRESH1", "Free Fire"]);
    }

    for (const [pathname, code, label] of paths) {
      const res = await fetchText(pathname);
      ok(`${label} 200`, res.status === 200, `status=${res.status}`);
      ok(`${label} live code shown`, res.text.includes(code));
      ok(`${label} idle banner hidden`, !hasIdle(res.text));
      ok(`${label} no app error`, !res.text.includes("Application error"));
    }
  }
} catch (err) {
  ok("e2e threw", false, err instanceof Error ? err.message : String(err));
} finally {
  await restore();
  ok("DB restored", true);
}

if (failures.length) {
  console.log(`\nFAILED (${failures.length}): ${failures.join(", ")}`);
  process.exit(1);
}
console.log("\nAll redeem freshness-banner e2e checks passed.");
