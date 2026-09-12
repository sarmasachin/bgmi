/**
 * Full PUBG APK parity e2e vs BGMI APK fixes:
 * save/update, empty alt, invalid/clear heroImage, button show/hide, timer↔CTAs.
 * Restores DB after. Run:
 *   E2E_BASE=http://127.0.0.1:3011 npx tsx scripts/e2e-pubg-apk-parity.mjs
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
const E2E_APK = "https://example.com/e2e-pubg-apk-parity.apk";
const E2E_HERO = "https://example.com/e2e-pubg-hero.png";
const E2E_SEO = "E2E PUBG APK parity SEO";
const E2E_H1 = "E2E PUBG APK H1";
const E2E_COUNTDOWN = "E2E PUBG parity countdown";
const TITLE_AS_URL = "PUBG Mobile APK 4.6 Update Download (APK + OBB)";

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

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const {
  DEFAULT_PUBG_APK_PAGE,
  PUBG_PLAY_STORE_URL,
  isPubgApkHeroButtonPublic,
  isPubgApkCountdownTicking,
  isUsablePubgHeroImageSrc,
  pubgApkHeroButtonPublicStatus,
} = await load("src/lib/pubgApkPage.ts");
const { normalizePubgApkPage } = await load("src/lib/pubgApkPageNormalize.ts");
const {
  getPubgApkPage,
  getPubgApkPageForAdmin,
  savePubgApkPage,
  clearPubgApkPage,
} = await load("src/server/repositories/pubgApkPageRepository.ts");

const before = await getPubgApkPageForAdmin();
let restored = false;
async function restore() {
  if (restored) return;
  restored = true;
  if (before.usingDefault) await clearPubgApkPage();
  else await savePubgApkPage(before.page);
}

try {
  console.log(`\nE2E_BASE=${BASE}`);

  console.log("\n== 1) Unit helpers (BGMI parity) ==");
  {
    ok("default apk.visible false", DEFAULT_PUBG_APK_PAGE.heroButtons.apk.visible === false);
    ok(
      "public gate needs URL",
      !isPubgApkHeroButtonPublic({ label: "APK", href: "", visible: true }),
    );
    ok(
      "public gate ok",
      isPubgApkHeroButtonPublic({ label: "APK", href: E2E_APK, visible: true }),
    );
    ok(
      "ticking future",
      isPubgApkCountdownTicking({ visible: true, targetIso: "2099-01-01T00:00:00+05:30" }),
    );
    ok(
      "not ticking when off",
      !isPubgApkCountdownTicking({ visible: false, targetIso: "2099-01-01T00:00:00+05:30" }),
    );
    ok(
      "not ticking when expired",
      !isPubgApkCountdownTicking({ visible: true, targetIso: "2020-01-01T00:00:00+05:30" }),
    );
    ok("usable https", isUsablePubgHeroImageSrc(E2E_HERO));
    ok("reject title text", !isUsablePubgHeroImageSrc(TITLE_AS_URL));
    const st = pubgApkHeroButtonPublicStatus({ label: "APK", href: "", visible: true });
    ok("status empty URL", !st.visible && /URL/i.test(st.message), st.message);
    const stTimer = pubgApkHeroButtonPublicStatus(
      { label: "APK", href: E2E_APK, visible: true },
      { visible: true, targetIso: "2099-06-01T12:00:00+05:30" },
    );
    ok("status hidden while ticking", !stTimer.visible && /timer/i.test(stTimer.message));
    ok(
      "empty alt persists",
      normalizePubgApkPage({ ...DEFAULT_PUBG_APK_PAGE, heroImageAlt: "" }).heroImageAlt === "",
    );
    ok(
      "invalid heroImage cleared",
      normalizePubgApkPage({ ...DEFAULT_PUBG_APK_PAGE, heroImage: TITLE_AS_URL }).heroImage === "",
    );
  }

  console.log("\n== 2) Save / update / reload ==");
  {
    const page = clone(DEFAULT_PUBG_APK_PAGE);
    page.seoTitle = E2E_SEO;
    page.heroTitle = E2E_H1;
    page.heroImage = E2E_HERO;
    page.heroImageAlt = "";
    page.heroButtons.playStore = {
      label: "Play Store",
      href: PUBG_PLAY_STORE_URL,
      visible: true,
    };
    page.heroButtons.apk = { label: "APK", href: E2E_APK, visible: true };
    page.countdown = {
      ...page.countdown,
      visible: false,
      targetIso: "",
      label: E2E_COUNTDOWN,
    };
    const saved = await savePubgApkPage(page);
    ok("save ok", saved.usingDefault === false);
    ok("seo saved", saved.page.seoTitle === E2E_SEO);
    ok("h1 saved", saved.page.heroTitle === E2E_H1);
    ok("hero image saved", saved.page.heroImage === E2E_HERO);
    ok("empty alt persisted", saved.page.heroImageAlt === "");
    ok("apk url saved", saved.page.heroButtons.apk.href === E2E_APK);

    const admin = await getPubgApkPageForAdmin();
    ok("admin reload seo", admin.page.seoTitle === E2E_SEO);
    ok("admin reload empty alt", admin.page.heroImageAlt === "");
    const pub = await getPubgApkPage();
    ok("public get seo", pub.seoTitle === E2E_SEO);
    ok("public get empty alt", pub.heroImageAlt === "");

    const clearedHero = await savePubgApkPage({ ...clone(admin.page), heroImage: "" });
    ok("clear heroImage persists", clearedHero.page.heroImage === "");
    ok("public clear heroImage", (await getPubgApkPage()).heroImage === "");

    const invalid = await savePubgApkPage({
      ...clone(clearedHero.page),
      heroImage: TITLE_AS_URL,
    });
    ok("invalid heroImage cleared on save", invalid.page.heroImage === "");
  }

  console.log("\n== 3) Buttons show/hide + timer ==");
  {
    const page = clone(await getPubgApkPage());
    page.seoTitle = E2E_SEO;
    page.heroTitle = E2E_H1;
    page.heroImage = E2E_HERO;
    page.heroImageAlt = "";
    page.countdown = { ...page.countdown, visible: false, targetIso: "", label: E2E_COUNTDOWN };
    page.heroButtons.playStore = {
      label: "Play Store",
      href: PUBG_PLAY_STORE_URL,
      visible: true,
    };
    page.heroButtons.apk = { label: "APK", href: E2E_APK, visible: true };
    await savePubgApkPage(page);

    const both = await fetchText("/pubg-apk");
    ok("GET /pubg-apk 200", both.status === 200, `status=${both.status}`);
    ok("no app error", !both.text.includes("Application error"));
    ok("seo/h1 on page", both.text.includes(E2E_SEO) && both.text.includes(E2E_H1));
    ok(
      "both CTAs shown",
      both.text.includes('aria-label="PUBG Mobile download options"') &&
        both.text.includes("ff-as-apk-btn--alt") &&
        both.text.includes(E2E_APK) &&
        both.text.includes("com.tencent.ig"),
    );
    ok("hero image shown", both.text.includes(E2E_HERO));
    ok(
      "empty alt on img",
      /ff-as-feature-image[^>]*alt=""/.test(both.text) ||
        both.text.includes(`src="${E2E_HERO}" alt=""`),
    );

    page.countdown = {
      ...page.countdown,
      visible: true,
      label: E2E_COUNTDOWN,
      targetIso: "2099-06-01T12:00:00+05:30",
    };
    await savePubgApkPage(page);
    const ticking = await fetchText("/pubg-apk");
    ok("timer ticking shows countdown", ticking.text.includes(E2E_COUNTDOWN));
    ok(
      "timer ticking hides download CTAs",
      !ticking.text.includes('aria-label="PUBG Mobile download options"') &&
        !ticking.text.includes("ff-as-apk-btn--alt"),
    );

    page.countdown.visible = false;
    await savePubgApkPage(page);
    const timerOff = await fetchText("/pubg-apk");
    ok(
      "timer off shows APK + Play",
      timerOff.text.includes(E2E_APK) && timerOff.text.includes("com.tencent.ig"),
    );

    page.countdown = {
      ...page.countdown,
      visible: true,
      label: E2E_COUNTDOWN,
      targetIso: "2020-01-01T00:00:00+05:30",
    };
    await savePubgApkPage(page);
    const expired = await fetchText("/pubg-apk");
    ok("expired timer still has countdown block/label", expired.text.includes(E2E_COUNTDOWN));
    ok(
      "expired timer shows download buttons",
      expired.text.includes(E2E_APK) &&
        expired.text.includes('aria-label="PUBG Mobile download options"'),
    );

    page.countdown.visible = false;
    page.countdown.targetIso = "";
    page.heroButtons.apk.visible = false;
    await savePubgApkPage(page);
    const hideApk = await fetchText("/pubg-apk");
    ok("APK hidden when Show off", !hideApk.text.includes("ff-as-apk-btn--alt"));
    ok("Play still shown", hideApk.text.includes("com.tencent.ig"));

    page.heroButtons.apk = { label: "APK", href: "", visible: true };
    await savePubgApkPage(page);
    const emptyUrl = await fetchText("/pubg-apk");
    ok("APK hidden when URL empty", !emptyUrl.text.includes("ff-as-apk-btn--alt"));

    page.heroButtons.apk = { label: "APK", href: E2E_APK, visible: true };
    page.heroButtons.playStore.visible = false;
    await savePubgApkPage(page);
    const apkOnly = await fetchText("/pubg-apk");
    ok("APK only shown", apkOnly.text.includes(E2E_APK));
    ok(
      "Play Store CTA not shown",
      !/class="ff-as-apk-btn"[^>]*href="https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.tencent\.ig"/.test(
        apkOnly.text,
      ),
    );
  }

  console.log("\n== 4) Pinned cards still present after saves ==");
  {
    const pub = await getPubgApkPage();
    ok("card #1 update", pub.cards[0]?.id === "latest-update-features");
    ok("card #5 ban", pub.cards[4]?.id === "ban-prevention-safety");
    const html = (await fetchText("/pubg-apk")).text;
    ok("OBB card on page", html.includes("OBB File Setup (Direct Search Intent)"));
    ok("FPS card on page", html.includes("90 FPS / Graphics Unlock Guide"));
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
console.log("\nAll PUBG APK parity e2e checks passed.");
