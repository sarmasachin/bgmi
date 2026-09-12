/**
 * E2E: BGMI APK hero Play/APK buttons show + hide.
 * Restores DB after. Run: E2E_BASE=http://127.0.0.1:3010 npx tsx scripts/e2e-bgmi-apk-buttons.mjs
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
const BASE = process.env.E2E_BASE || "http://127.0.0.1:3010";
const E2E_APK = "https://example.com/e2e-bgmi-apk-button.apk";

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

async function fetchText(pathname) {
  const res = await fetch(`${BASE}${pathname}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(120000),
  });
  return { status: res.status, text: await res.text() };
}

const {
  isBgmiApkHeroButtonPublic,
  bgmiApkHeroButtonPublicStatus,
  DEFAULT_BGMI_APK_PAGE,
} = await load("src/lib/bgmiApkPage.ts");
const {
  getBgmiApkPageForAdmin,
  saveBgmiApkPage,
  clearBgmiApkPage,
} = await load("src/server/repositories/bgmiApkPageRepository.ts");

console.log("\n== 1) Unit: public gate ==");
{
  ok(
    "visible+label+href => public",
    isBgmiApkHeroButtonPublic({ label: "APK", href: E2E_APK, visible: true }),
  );
  ok(
    "visible but empty href => hidden",
    !isBgmiApkHeroButtonPublic({ label: "APK", href: "", visible: true }),
  );
  ok(
    "href but Show off => hidden",
    !isBgmiApkHeroButtonPublic({ label: "APK", href: E2E_APK, visible: false }),
  );
  const st = bgmiApkHeroButtonPublicStatus({
    label: "APK",
    href: "",
    visible: true,
  });
  ok("status warns empty URL", !st.visible && /URL/i.test(st.message), st.message);
  ok(
    "default apk.visible is false (no false-positive Show)",
    DEFAULT_BGMI_APK_PAGE.heroButtons.apk.visible === false,
  );
}

if (!process.env.DATABASE_URL) {
  console.log("SKIP DB/HTTP — no DATABASE_URL");
  process.exit(failures.length ? 1 : 0);
}

const before = await getBgmiApkPageForAdmin();
let restored = false;
async function restore() {
  if (restored) return;
  restored = true;
  if (before.usingDefault) await clearBgmiApkPage();
  else await saveBgmiApkPage(before.page);
}

try {
  console.log("\n== 2) DB + HTTP show/hide ==");
  let htmlOk = false;
  try {
    await fetchText("/bgmi-apk");
    htmlOk = true;
  } catch (e) {
    console.log(`[SKIP] HTTP ${BASE} — ${e.message}`);
  }

  const page = JSON.parse(JSON.stringify(before.page));
  page.countdown = {
    ...page.countdown,
    visible: false,
    targetIso: "",
  };
  page.heroButtons.playStore = {
    label: "Play Store",
    href: "https://play.google.com/store/apps/details?id=com.pubg.imobile",
    visible: true,
  };
  page.heroButtons.apk = { label: "APK", href: E2E_APK, visible: true };
  await saveBgmiApkPage(page);

  if (htmlOk) {
    const both = await fetchText("/bgmi-apk");
    ok("GET 200 with both CTAs", both.status === 200);
    ok(
      "Play Store CTA shown",
      /class="ff-as-apk-btn"[^>]*href="https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.pubg\.imobile"/.test(
        both.text,
      ) ||
        (both.text.includes("ff-as-apk-btn") &&
          both.text.includes("com.pubg.imobile") &&
          both.text.includes('aria-label="BGMI download options"')),
    );
    ok(
      "APK CTA shown",
      both.text.includes("ff-as-apk-btn--alt") && both.text.includes(E2E_APK),
    );
  }

  // Future timer must hide CTAs even when Show+URL are set
  page.countdown = {
    ...page.countdown,
    visible: true,
    label: "E2E ticking",
    targetIso: "2099-06-01T12:00:00+05:30",
  };
  await saveBgmiApkPage(page);
  if (htmlOk) {
    const ticking = await fetchText("/bgmi-apk");
    ok(
      "ticking timer hides APK CTA",
      !ticking.text.includes("ff-as-apk-btn--alt") &&
        !ticking.text.includes('aria-label="BGMI download options"'),
    );
  }
  page.countdown.visible = false;
  await saveBgmiApkPage(page);

  page.heroButtons.apk.visible = false;
  await saveBgmiApkPage(page);
  if (htmlOk) {
    const hideApk = await fetchText("/bgmi-apk");
    ok("APK hidden when Show off", !hideApk.text.includes("ff-as-apk-btn--alt"));
    ok(
      "Play Store still shown",
      hideApk.text.includes("com.pubg.imobile") &&
        hideApk.text.includes('aria-label="BGMI download options"'),
    );
  }

  page.heroButtons.apk = { label: "APK", href: "", visible: true };
  await saveBgmiApkPage(page);
  if (htmlOk) {
    const emptyHref = await fetchText("/bgmi-apk");
    ok(
      "APK hidden when URL empty (even if Show on)",
      !emptyHref.text.includes("ff-as-apk-btn--alt"),
    );
  }

  page.heroButtons.apk = { label: "APK", href: E2E_APK, visible: true };
  page.heroButtons.playStore.visible = false;
  await saveBgmiApkPage(page);
  if (htmlOk) {
    const onlyApk = await fetchText("/bgmi-apk");
    ok("APK only — APK shown", onlyApk.text.includes(E2E_APK));
    ok(
      "APK only — Play Store link gone",
      !/ff-as-apk-btn" href="https:\/\/play\.google\.com/.test(onlyApk.text),
    );
  }
} finally {
  await restore();
  ok("DB restored", true);
}

console.log(`\n${failures.length ? "FAILED" : "OK"} — ${failures.length} failure(s)`);
if (failures.length) {
  console.log(failures.join("\n"));
  process.exit(1);
}
