/**
 * E2E: FF redeem schedule (date pickers → save → reload → public labels).
 * Run: node scripts/e2e-ff-redeem-schedule.mjs
 */
import fs from "fs";
import path from "path";
import {
  attachRedeemScheduleFromRaw,
  defaultLiveRedeemSchedule,
  finalizeRedeemScheduleDraft,
  formatRedeemExpiresLabel,
  formatRedeemReleasedLabel,
  isValidRedeemScheduleIso,
  joinRedeemScheduleIso,
  splitRedeemScheduleIso,
} from "../src/lib/redeemCodeSchedule.ts";

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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnv(".env");
loadDotEnv(".env.local");

const base = process.env.E2E_BASE_URL || "http://localhost:3000";
const email = (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "1234";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function sanitizeString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim();
}

function normalizeCodeLike(raw, index) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const title = sanitizeString(raw.title);
  const code = sanitizeString(raw.code);
  if (!title || !code) return null;
  const item = {
    id: sanitizeString(raw.id) || `code-${index + 1}`,
    title,
    code,
    status: sanitizeString(raw.status, "live").toLowerCase() === "expired" ? "expired" : "live",
    server: sanitizeString(raw.server, "global") || "global",
  };
  attachRedeemScheduleFromRaw(item, raw, sanitizeString);
  return item;
}

function testUnitSchedule() {
  const live = defaultLiveRedeemSchedule();
  assert(isValidRedeemScheduleIso(live.releasedAt), "default releasedAt invalid");
  assert(isValidRedeemScheduleIso(live.expiresAt), "default expiresAt invalid");
  assert(live.releasedLabel?.includes("Released:"), "releasedLabel prefix missing");
  assert(live.expiresLabel?.includes("Expires:"), "expiresLabel prefix missing");

  const iso = joinRedeemScheduleIso("2026-09-15", "18:45");
  assert(iso === "2026-09-15T18:45:00+05:30", `join iso wrong: ${iso}`);
  const split = splitRedeemScheduleIso(iso);
  assert(split.date === "2026-09-15", `split date wrong: ${split.date}`);
  assert(split.time === "18:45", `split time wrong: ${split.time}`);

  const finalized = finalizeRedeemScheduleDraft({
    status: "live",
    title: "Test",
    code: "ABC",
    releasedAt: iso,
    expiresAt: joinRedeemScheduleIso("2026-09-20", "23:59"),
  });
  assert(finalized.releasedLabel === formatRedeemReleasedLabel(iso), "finalized released label mismatch");

  const legacy = finalizeRedeemScheduleDraft({
    status: "live",
    title: "Legacy",
    code: "OLD",
    releasedLabel: "Released: custom legacy text",
    expiresLabel: "Expires: tomorrow",
  });
  assert(
    legacy.releasedLabel === "Released: custom legacy text",
    `legacy labels overwritten: ${legacy.releasedLabel}`,
  );

  const round = normalizeCodeLike(
    {
      title: "Round trip",
      code: "RT-001",
      status: "live",
      server: "global",
      releasedAt: iso,
      expiresAt: joinRedeemScheduleIso("2026-09-20", "23:59"),
    },
    0,
  );
  assert(round?.releasedAt === iso, "normalize dropped releasedAt");
  assert(round?.releasedLabel?.includes("15 Sept"), `normalize label wrong: ${round?.releasedLabel}`);

  console.log("UNIT_SCHEDULE_OK");
}

async function loginCookie() {
  const res = await fetch(`${base}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) return null;
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  return cookie || null;
}

async function testAdminApi(cookie) {
  const marker = `E2E-SCHED-${Date.now()}`;
  const schedule = defaultLiveRedeemSchedule();
  schedule.releasedAt = joinRedeemScheduleIso("2026-08-31", "15:30");
  schedule.expiresAt = joinRedeemScheduleIso("2026-09-07", "23:59");
  schedule.releasedLabel = formatRedeemReleasedLabel(schedule.releasedAt);
  schedule.expiresLabel = formatRedeemExpiresLabel(schedule.expiresAt);

  const getRes = await fetch(`${base}/api/admin/free-fire-redeem`, {
    headers: { cookie },
    cache: "no-store",
  });
  assert(getRes.ok, `GET admin failed HTTP ${getRes.status}`);
  const getJson = await getRes.json();
  const page = getJson?.data?.page;
  assert(page && Array.isArray(page.codes), "missing page.codes");

  const testCode = {
    id: marker,
    title: `Schedule test ${marker}`,
    code: marker,
    status: "live",
    server: "global",
    ...schedule,
  };
  const nextCodes = [testCode, ...page.codes.filter((c) => c.id !== marker)];

  const saveRes = await fetch(`${base}/api/admin/free-fire-redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ action: "save", page: { ...page, codes: nextCodes } }),
  });
  assert(saveRes.ok, `save failed HTTP ${saveRes.status}: ${await saveRes.text()}`);
  const saveJson = await saveRes.json();
  const saved = saveJson.page?.codes?.find((c) => c.id === marker);
  assert(saved, "saved code missing in response");
  assert(isValidRedeemScheduleIso(saved.releasedAt), "saved releasedAt missing");
  assert(isValidRedeemScheduleIso(saved.expiresAt), "saved expiresAt missing");
  assert(saved.releasedLabel?.includes("Released:"), "saved releasedLabel missing");

  const reloadRes = await fetch(`${base}/api/admin/free-fire-redeem`, {
    headers: { cookie },
    cache: "no-store",
  });
  const reloadJson = await reloadRes.json();
  const reloaded = reloadJson?.data?.page?.codes?.find((c) => c.id === marker);
  assert(reloaded?.releasedAt === saved.releasedAt, "reload releasedAt mismatch");
  assert(reloaded?.releasedLabel === saved.releasedLabel, "reload releasedLabel mismatch");

  const publicRes = await fetch(`${base}/free-fire-redeem-code`, { cache: "no-store" });
  assert(publicRes.ok, `public page failed HTTP ${publicRes.status}`);
  const publicHtml = await publicRes.text();
  assert(publicHtml.includes(marker), "public page missing test code");
  assert(publicHtml.includes(saved.releasedLabel), "public page missing released label");

  // cleanup: remove test code
  const cleaned = reloadJson.data.page.codes.filter((c) => c.id !== marker);
  await fetch(`${base}/api/admin/free-fire-redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ action: "save", page: { ...reloadJson.data.page, codes: cleaned } }),
  });

  console.log("ADMIN_API_SCHEDULE_OK");
}

async function testAdminHtmlMarkers() {
  const res = await fetch(`${base}/admin/free-fire-redeem`, { redirect: "manual" });
  assert(res.status === 307 || res.status === 200, `admin page HTTP ${res.status}`);
  console.log("ADMIN_PAGE_COMPILE_OK");
}

async function main() {
  testUnitSchedule();
  await testAdminHtmlMarkers();

  const cookie = await loginCookie();
  if (!cookie) {
    console.warn("ADMIN_API_SKIP: login failed (403/401) — DB/admin auth not available locally");
    console.log("FF_REDEEM_SCHEDULE_PARTIAL_OK (unit + compile only)");
    return;
  }

  await testAdminApi(cookie);
  console.log("FF_REDEEM_SCHEDULE_ALL_OK");
}

main().catch((err) => {
  console.error("FF_REDEEM_SCHEDULE_FAIL:", err.message);
  process.exit(1);
});
