/**
 * Full e2e for /bgmi-apk (admin save → public → show/hide → reset).
 * Restores DB after. Run:
 *   E2E_BASE=http://127.0.0.1:3011 npx tsx scripts/e2e-bgmi-apk-check.mjs
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
const E2E_APK = "https://example.com/e2e-bgmi-apk-check.apk";
const E2E_SEO = "E2E BGMI APK SEO TITLE";
const E2E_H1 = "E2E BGMI APK H1 TITLE";
const E2E_SUB = "E2E BGMI APK subtitle line";
const E2E_COUNTDOWN = "E2E BGMI APK countdown label";
const E2E_HERO_IMG = "/icon.png?v=e2e-bgmi-apk-full";
const E2E_COMMENT = "E2E comment for BGMI APK — should stay pending.";
const DEFAULT_ALT = "BGMI download guide — Play Store and APK options";

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

async function fetchText(pathname, opts = {}) {
  const res = await fetch(`${BASE}${pathname}`, {
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(120000),
    ...opts,
  });
  const text = await res.text();
  return { status: res.status, location: res.headers.get("location"), text };
}

function clone(page) {
  return JSON.parse(JSON.stringify(page));
}

function parseLd(html) {
  const out = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    try {
      out.push(JSON.parse(m[1]));
    } catch {
      out.push({ _invalid: true, raw: m[1].slice(0, 80) });
    }
  }
  return out;
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing — cannot run full BGMI APK e2e");
  process.exit(1);
}

const repo = await load("src/server/repositories/bgmiApkPageRepository.ts");
const pageMod = await load("src/lib/bgmiApkPage.ts");
const normMod = await load("src/lib/bgmiApkPageNormalize.ts");
const dbMod = await load("src/db/client.ts");
const {
  getBgmiApkPage,
  getBgmiApkPageForAdmin,
  saveBgmiApkPage,
  clearBgmiApkPage,
} = repo;
const {
  DEFAULT_BGMI_APK_PAGE,
  BGMI_APK_PAGE_KEY,
  BGMI_PLAY_STORE_URL,
  isBgmiApkHeroButtonPublic,
} = pageMod;
const { normalizeBgmiApkPage } = normMod;
const { prisma } = dbMod;

const before = await getBgmiApkPageForAdmin();
let restored = false;

async function restore() {
  if (restored) return;
  restored = true;
  if (before.usingDefault) await clearBgmiApkPage();
  else await saveBgmiApkPage(before.page);
  await prisma.pageComment.deleteMany({
    where: { message: { contains: "E2E comment for BGMI APK" } },
  });
}

try {
  console.log(`\nE2E_BASE=${BASE}`);
  console.log(`before.usingDefault=${before.usingDefault}`);

  console.log("\n== 0) Normalize / defaults sanity ==");
  {
    ok("pageKey bgmi-apk", BGMI_APK_PAGE_KEY === "bgmi-apk");
    ok("default path /bgmi-apk", DEFAULT_BGMI_APK_PAGE.path === "/bgmi-apk");
    ok("default Play Store India listing", String(BGMI_PLAY_STORE_URL).includes("com.pubg.imobile"));
    ok("default apk href empty", DEFAULT_BGMI_APK_PAGE.heroButtons.apk.href === "");
    ok("default apk visible false", DEFAULT_BGMI_APK_PAGE.heroButtons.apk.visible === false);
    ok("default countdown hidden", DEFAULT_BGMI_APK_PAGE.countdown.visible === false);
    ok(
      "empty alt stays empty after normalize",
      normalizeBgmiApkPage({ ...DEFAULT_BGMI_APK_PAGE, heroImageAlt: "" }).heroImageAlt === "",
    );
    ok(
      "missing alt falls back to default",
      normalizeBgmiApkPage({}).heroImageAlt === DEFAULT_ALT,
    );
    ok(
      "public gate needs URL",
      !isBgmiApkHeroButtonPublic({ label: "APK", href: "", visible: true }),
    );
    ok(
      "public gate ok with URL",
      isBgmiApkHeroButtonPublic({ label: "APK", href: E2E_APK, visible: true }),
    );
  }

  console.log("\n== 1) HTTP gates ==");
  {
    const pub = await fetchText("/bgmi-apk");
    ok("public 200", pub.status === 200, `status=${pub.status}`);

    const lite = await fetchText("/bgmi-lite-apk");
    ok("lite apk still 200", lite.status === 200);

    const pubg = await fetchText("/pubg-apk");
    ok("pubg apk still 200", pubg.status === 200);

    const admin = await fetchText("/admin/bgmi-apk");
    ok(
      "admin unauth → login",
      (admin.status === 307 || admin.status === 302) &&
        String(admin.location || "").includes("/admin/login"),
      `status=${admin.status} loc=${admin.location || ""}`,
    );

    const api = await fetchText("/api/admin/bgmi-apk");
    ok("admin API unauth 401", api.status === 401, `status=${api.status}`);
  }

  console.log("\n== 2) Save full page payload (repo = admin save path) ==");
  {
    const page = clone(DEFAULT_BGMI_APK_PAGE);
    page.seoTitle = E2E_SEO;
    page.seoDescription = "E2E BGMI APK meta description";
    page.heroTitle = E2E_H1;
    page.subtitleEn = E2E_SUB;
    page.pills = [{ label: "E2E pill one" }, { label: "E2E pill two" }];
    page.heroImage = E2E_HERO_IMG;
    page.heroImageAlt = "";
    page.heroButtons.playStore = {
      label: "Play Store",
      href: BGMI_PLAY_STORE_URL,
      visible: true,
    };
    page.heroButtons.apk = { label: "APK", href: E2E_APK, visible: true };
    page.countdown = {
      ...page.countdown,
      visible: true,
      label: E2E_COUNTDOWN,
      targetIso: "2099-12-31T18:00:00+05:30",
      dateText: "E2E date line",
    };
    page.articleHtml = `${page.articleHtml}<script>alert("xss")</script><p>E2E sanitized paragraph</p>`;
    page.faqTitle = "E2E FAQ title";
    page.commentsLead = "E2E comments lead";

    const saved = await saveBgmiApkPage(page);
    ok("save persisted", saved.usingDefault === false && saved.page.seoTitle === E2E_SEO);
    ok("path locked to /bgmi-apk", saved.page.path === "/bgmi-apk");
    ok("H1 saved", saved.page.heroTitle === E2E_H1);
    ok("subtitle saved", saved.page.subtitleEn === E2E_SUB);
    ok("hero image saved", saved.page.heroImage === E2E_HERO_IMG);
    ok("empty heroImageAlt persisted", saved.page.heroImageAlt === "");
    ok("APK href saved", saved.page.heroButtons.apk.href === E2E_APK);
    ok("APK visible saved", saved.page.heroButtons.apk.visible === true);
    ok("Play Store URL kept", saved.page.heroButtons.playStore.href.includes("com.pubg.imobile"));
    ok("countdown saved", saved.page.countdown.visible && saved.page.countdown.label === E2E_COUNTDOWN);
    ok(
      "XSS script stripped",
      !saved.page.articleHtml.includes("<script") &&
        saved.page.articleHtml.includes("E2E sanitized paragraph"),
    );

    const adminReload = await getBgmiApkPageForAdmin();
    ok("admin reload keeps SEO", adminReload.page.seoTitle === E2E_SEO);
    ok("admin reload keeps empty alt", adminReload.page.heroImageAlt === "");
    ok("admin reload keeps APK URL", adminReload.page.heroButtons.apk.href === E2E_APK);

    const publicGet = await getBgmiApkPage();
    ok("public get keeps SEO", publicGet.seoTitle === E2E_SEO);
    ok("public get keeps empty alt", publicGet.heroImageAlt === "");
  }

  console.log("\n== 3) Public HTML after full save ==");
  {
    const pub = await fetchText("/bgmi-apk");
    const html = pub.text;
    ok("public 200 after save", pub.status === 200);
    ok("no app error", !html.includes("Application error") && !html.includes("Internal Server Error"));
    ok("e2e SEO title in page", html.includes(E2E_SEO));
    ok("e2e H1 in page", html.includes(E2E_H1));
    ok("e2e subtitle in page", html.includes(E2E_SUB));
    ok("e2e pills in page", html.includes("E2E pill one") && html.includes("E2E pill two"));
    ok("hero image src", html.includes(E2E_HERO_IMG));
    ok(
      "hero img empty alt (not default string)",
      /ff-as-feature-image[^>]*alt=""/.test(html) ||
        html.includes(`src="${E2E_HERO_IMG}" alt=""`),
    );
    ok("default alt string not forced in img", !new RegExp(`ff-as-feature-image[^>]*${DEFAULT_ALT}`).test(html));
    ok("countdown shown while ticking", html.includes("ff-as-countdown") && html.includes(E2E_COUNTDOWN));
    ok(
      "download CTAs hidden while timer ticking",
      !html.includes('aria-label="BGMI download options"') && !html.includes("ff-as-apk-btn--alt"),
    );
    ok("sanitized article text", html.includes("E2E sanitized paragraph"));
    ok("script tag not executed content", !html.includes('alert("xss")'));
    ok("FAQ title", html.includes("E2E FAQ title"));
    ok("comments lead", html.includes("E2E comments lead"));
    ok("comments form", html.includes("Post comment"));
    ok("guide anchor", html.includes('id="bgmi-apk-guide"'));
    ok("canonical /bgmi-apk", html.includes("/bgmi-apk"));
    ok("India listing not global PUBG package", !html.includes("com.tencent.ig") || html.includes("com.pubg.imobile"));

    const ld = parseLd(html);
    ok("JSON-LD scripts parse", ld.length >= 2 && ld.every((item) => !item._invalid), `count=${ld.length}`);
    ok(
      "breadcrumb / webPage LD",
      ld.some((item) => JSON.stringify(item).includes("WebPage")) ||
        ld.some((item) => JSON.stringify(item).includes("BreadcrumbList")),
    );

    // Turn timer off → download buttons must appear with same saved URLs
    const after = await getBgmiApkPageForAdmin();
    const withButtons = clone(after.page);
    withButtons.countdown.visible = false;
    await saveBgmiApkPage(withButtons);
    const unlocked = await fetchText("/bgmi-apk");
    ok("after timer off APK button shown", unlocked.text.includes("ff-as-apk-btn--alt") && unlocked.text.includes(E2E_APK));
    ok("after timer off Play Store shown", unlocked.text.includes("com.pubg.imobile"));
    ok("after timer off hero btn group", unlocked.text.includes('aria-label="BGMI download options"'));
  }

  console.log("\n== 4) Show/hide Play + APK ==");
  {
    const page = clone(DEFAULT_BGMI_APK_PAGE);
    page.seoTitle = E2E_SEO;
    page.heroButtons.playStore.visible = false;
    page.heroButtons.apk = { label: "APK", href: E2E_APK, visible: true };
    page.countdown = { ...page.countdown, visible: false, targetIso: "" };
    await saveBgmiApkPage(page);
    const pub = await fetchText("/bgmi-apk");
    const playAnchor = /class="ff-as-apk-btn"[^>]*href="https:\/\/play\.google\.com/.test(pub.text);
    ok("Play Store CTA gone", !playAnchor, playAnchor ? "play store still rendered" : "");
    ok("APK CTA still on", pub.text.includes(E2E_APK) && pub.text.includes("ff-as-apk-btn--alt"));

    page.heroButtons.apk = { label: "APK", href: "", visible: true };
    page.heroButtons.playStore = {
      label: "Play Store",
      href: BGMI_PLAY_STORE_URL,
      visible: true,
    };
    await saveBgmiApkPage(page);
    const pub2 = await fetchText("/bgmi-apk");
    ok("empty APK href hides APK", !pub2.text.includes("ff-as-apk-btn--alt"));
    ok("Play Store back", pub2.text.includes("com.pubg.imobile"));

    page.heroButtons.apk = { label: "APK", href: E2E_APK, visible: false };
    await saveBgmiApkPage(page);
    const pub3 = await fetchText("/bgmi-apk");
    ok(
      "Show off hides APK even with URL",
      !pub3.text.includes("ff-as-apk-btn--alt"),
    );
  }

  console.log("\n== 4b) Timer ticking hides buttons; timer off/expired shows ==");
  {
    const page = clone(DEFAULT_BGMI_APK_PAGE);
    page.seoTitle = E2E_SEO;
    page.heroButtons.playStore = {
      label: "Play Store",
      href: BGMI_PLAY_STORE_URL,
      visible: true,
    };
    page.heroButtons.apk = { label: "APK", href: E2E_APK, visible: true };
    page.countdown = {
      ...page.countdown,
      visible: true,
      label: E2E_COUNTDOWN,
      targetIso: "2099-12-31T18:00:00+05:30",
      dateText: "E2E date line",
    };
    await saveBgmiApkPage(page);
    const ticking = await fetchText("/bgmi-apk");
    ok("timer ticking shows countdown", ticking.text.includes(E2E_COUNTDOWN));
    ok(
      "timer ticking hides download CTAs",
      !ticking.text.includes('aria-label="BGMI download options"') &&
        !ticking.text.includes("ff-as-apk-btn--alt"),
    );

    page.countdown.visible = false;
    await saveBgmiApkPage(page);
    const hidden = await fetchText("/bgmi-apk");
    ok("timer off shows APK button", hidden.text.includes(E2E_APK));
    ok("timer off shows Play Store", hidden.text.includes("com.pubg.imobile"));

    page.countdown = {
      ...page.countdown,
      visible: true,
      targetIso: "2020-01-01T00:00:00+05:30",
      label: E2E_COUNTDOWN,
    };
    await saveBgmiApkPage(page);
    const expired = await fetchText("/bgmi-apk");
    ok("expired timer still shows live block/label", expired.text.includes(E2E_COUNTDOWN));
    ok("expired timer shows download buttons", expired.text.includes(E2E_APK));
  }

  console.log("\n== 5) Isolation vs Lite + PUBG APK ==");
  {
    const page = clone(DEFAULT_BGMI_APK_PAGE);
    page.seoTitle = E2E_SEO;
    page.heroButtons.apk = { label: "APK", href: E2E_APK, visible: true };
    await saveBgmiApkPage(page);

    const lite = await fetchText("/bgmi-lite-apk");
    ok("lite still 200", lite.status === 200);
    ok("lite no e2e SEO", !lite.text.includes(E2E_SEO));
    ok("lite no e2e apk url", !lite.text.includes("e2e-bgmi-apk-check.apk"));

    const pubg = await fetchText("/pubg-apk");
    ok("pubg no e2e SEO", !pubg.text.includes(E2E_SEO));
    ok("pubg no e2e apk url", !pubg.text.includes("e2e-bgmi-apk-check.apk"));
  }

  console.log("\n== 6) Comments API ==");
  {
    const bad = await fetch(`${BASE}/api/page-comments?pageKey=not-a-real-page`);
    ok("unknown pageKey GET 400", bad.status === 400);

    const getOk = await fetch(`${BASE}/api/page-comments?pageKey=${BGMI_APK_PAGE_KEY}`);
    const getJson = await getOk.json();
    ok(
      "GET comments 200 + array",
      getOk.status === 200 && Array.isArray(getJson.data),
      `status=${getOk.status}`,
    );

    const post = await fetch(`${BASE}/api/page-comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageKey: BGMI_APK_PAGE_KEY,
        name: "E2E Checker",
        message: E2E_COMMENT,
      }),
    });
    const postJson = await post.json();
    ok(
      "POST comment pending",
      post.status === 200 && postJson.ok === true && postJson.status === "pending",
      `status=${post.status} body=${JSON.stringify(postJson)}`,
    );

    const pub = await fetchText("/bgmi-apk");
    ok("pending comment not on public list", !pub.text.includes("E2E comment for BGMI APK"));
  }

  console.log("\n== 7) Reset / defaults ==");
  {
    await clearBgmiApkPage();
    const admin = await getBgmiApkPageForAdmin();
    ok("reset usingDefault", admin.usingDefault === true);
    const pub = await fetchText("/bgmi-apk");
    ok("after reset 200", pub.status === 200);
    ok("after reset e2e SEO gone", !pub.text.includes(E2E_SEO));
    ok("after reset e2e H1 gone", !pub.text.includes(E2E_H1));
    ok("after reset e2e apk gone", !pub.text.includes("e2e-bgmi-apk-check.apk"));
    ok("after reset countdown hidden", !pub.text.includes("ff-as-countdown"));
    ok("after reset Play Store back", pub.text.includes("com.pubg.imobile"));
    ok("default APK button hidden", !pub.text.includes("ff-as-apk-btn--alt"));
  }

  console.log("\n== 8) Sitemap + robots ==");
  {
    const sm = await fetchText("/sitemap-pages.xml");
    ok("sitemap-pages lists /bgmi-apk", sm.status === 200 && sm.text.includes("/bgmi-apk"));
    ok("sitemap still lists lite apk", sm.text.includes("/bgmi-lite-apk"));
    ok("sitemap still lists pubg apk", sm.text.includes("/pubg-apk"));

    const idx = await fetchText("/sitemap.xml");
    ok("sitemap index points to pages", idx.status === 200 && idx.text.includes("sitemap-pages.xml"));

    const robots = await fetchText("/robots.txt");
    ok("robots allow /", robots.status === 200 && robots.text.includes("Allow: /"));
    ok("robots does not disallow /bgmi-apk", !robots.text.includes("Disallow: /bgmi-apk"));
  }
} catch (err) {
  ok("e2e threw", false, err instanceof Error ? err.message : String(err));
} finally {
  await restore();
  const after = await getBgmiApkPageForAdmin();
  ok(
    "DB restored",
    before.usingDefault
      ? after.usingDefault === true
      : after.page.seoTitle === before.page.seoTitle &&
          after.page.heroButtons.apk.href === before.page.heroButtons.apk.href,
    `now seo=${after.page.seoTitle}`,
  );
  console.log("\nDB restored.");
}

if (failures.length) {
  console.log(`\nFAILED (${failures.length}): ${failures.join(", ")}`);
  process.exit(1);
}
console.log("\nAll BGMI APK e2e checks passed.");
