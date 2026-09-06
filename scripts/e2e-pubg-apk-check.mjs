/**
 * One-shot e2e for /pubg-apk (BGMI APK parity). Restores DB after.
 * Run: npx tsx scripts/e2e-pubg-apk-check.mjs
 */
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const BASE = process.env.E2E_BASE || "http://127.0.0.1:3000";
const E2E_APK = "https://example.com/e2e-pubg-apk-check.apk";
const E2E_SEO = "E2E PUBG APK SEO TITLE";
const E2E_COUNTDOWN = "E2E PUBG APK countdown label";
const E2E_COMMENT = "E2E comment for PUBG APK — should stay pending.";

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

async function fetchText(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store", redirect: "manual", ...opts });
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

const repo = await load("src/server/repositories/pubgApkPageRepository.ts");
const pageMod = await load("src/lib/pubgApkPage.ts");
const dbMod = await load("src/db/client.ts");
const {
  getPubgApkPageForAdmin,
  savePubgApkPage,
  clearPubgApkPage,
} = repo;
const { DEFAULT_PUBG_APK_PAGE, PUBG_APK_PAGE_KEY, PUBG_PLAY_STORE_URL } = pageMod;
const { prisma } = dbMod;

const before = await getPubgApkPageForAdmin();
let restored = false;

async function restore() {
  if (restored) return;
  restored = true;
  if (before.usingDefault) await clearPubgApkPage();
  else await savePubgApkPage(before.page);
  await prisma.pageComment.deleteMany({
    where: { message: { contains: "E2E comment for PUBG APK" } },
  });
}

try {
  console.log("\n== 1) HTTP gates ==");
  {
    const pub = await fetchText("/pubg-apk");
    ok("public 200", pub.status === 200, `status=${pub.status}`);

    const lite = await fetchText("/pubg-mobile-lite-apk");
    ok("lite apk still 200", lite.status === 200);

    const bgmi = await fetchText("/bgmi-apk");
    ok("bgmi apk still 200", bgmi.status === 200);

    const admin = await fetchText("/admin/pubg-apk");
    ok(
      "admin unauth → login",
      (admin.status === 307 || admin.status === 302) && String(admin.location || "").includes("/admin/login"),
      `status=${admin.status} loc=${admin.location || ""}`,
    );

    const api = await fetchText("/api/admin/pubg-apk");
    ok("admin API unauth 401", api.status === 401, `status=${api.status}`);
  }

  console.log("\n== 2) Default public HTML ==");
  {
    const pub = await fetchText("/pubg-apk");
    const html = pub.text;
    ok("h1 PUBG Mobile APK", html.includes(">PUBG Mobile APK<") || html.includes("PUBG Mobile APK"));
    ok("canonical /pubg-apk", html.includes("/pubg-apk"));
    ok("Play Store listing", html.includes("com.tencent.ig"));
    ok("Play Store button text", html.includes("Play Store"));
    ok("APK alt button hidden (empty href)", !html.includes("ff-as-apk-btn--alt"));
    ok("countdown hidden by default", !html.includes("ff-as-countdown"));
    ok("not BGMI India listing", html.includes("Global PUBG Mobile (not BGMI)"));
    ok("not Lite client pill", html.includes("Full client (not Lite)"));
    ok("FAQ present", html.includes("Does this site host a PUBG Mobile APK file?"));
    ok("comments form", html.includes("Post comment"));
    ok("nav dropdown PUBG APK", html.includes('href="/pubg-apk">PUBG APK') || html.includes("PUBG APK"));
    ok("lite CTA card", html.includes("/pubg-mobile-lite-apk"));
    ok("calculator CTA", html.includes('href="/pubg"'));
    ok("guide anchor", html.includes('id="pubg-apk-guide"'));
    ok("no APK file host claim", html.includes("does not host") || html.includes("do not host"));
    ok("not lite countdown date", !html.includes("12 November 2026"));
    ok("robots index", html.includes("max-image-preview") || html.includes("index, follow") || html.includes("PUBG Mobile APK &amp; Play Store"));

    const ld = parseLd(html);
    ok("JSON-LD scripts parse", ld.length >= 2 && ld.every((item) => !item._invalid), `count=${ld.length}`);
    const types = ld.map((item) => item["@type"] || item["@graph"]?.[0]?.["@type"]).join(",");
    ok("breadcrumb LD", ld.some((item) => JSON.stringify(item).includes("PUBG APK")));
    ok("webPage LD", types.includes("WebPage") || ld.some((item) => JSON.stringify(item).includes("WebPage")));

    const lite = await fetchText("/pubg-mobile-lite-apk");
    ok("lite page is still Lite", lite.text.includes("PUBG Lite APK") || lite.text.includes("PUBG Mobile Lite"));
    ok("lite does not use full PUBG APK h1", !lite.text.includes(">PUBG Mobile APK<"));
  }

  console.log("\n== 3) Save APK URL + countdown (admin repo path) ==");
  {
    const page = clone(DEFAULT_PUBG_APK_PAGE);
    page.seoTitle = E2E_SEO;
    page.heroButtons.apk = { label: "APK", href: E2E_APK, visible: true };
    page.countdown = {
      ...page.countdown,
      visible: true,
      label: E2E_COUNTDOWN,
      targetIso: "2099-12-31T18:00:00+05:30",
      dateText: "E2E date line",
    };
    page.articleHtml = `${page.articleHtml}<script>alert("xss")</script><p>E2E sanitized paragraph</p>`;
    const saved = await savePubgApkPage(page);
    ok("save persisted", saved.usingDefault === false && saved.page.seoTitle === E2E_SEO);
    ok("path locked to /pubg-apk", saved.page.path === "/pubg-apk");
    ok("XSS script stripped", !saved.page.articleHtml.includes("<script") && saved.page.articleHtml.includes("E2E sanitized paragraph"));
    ok("Play Store URL kept", saved.page.heroButtons.playStore.href.includes("com.tencent.ig"));
  }

  console.log("\n== 4) Public HTML after save ==");
  {
    const pub = await fetchText("/pubg-apk");
    const html = pub.text;
    ok("public 200 after save", pub.status === 200);
    ok("e2e SEO title in page", html.includes(E2E_SEO));
    ok("APK button shown", html.includes("ff-as-apk-btn--alt") && html.includes(E2E_APK));
    ok("Play Store still shown", html.includes("com.tencent.ig"));
    ok("countdown shown", html.includes("ff-as-countdown") && html.includes(E2E_COUNTDOWN));
    ok("sanitized article text", html.includes("E2E sanitized paragraph"));
    ok("script tag not in article", !html.includes('alert("xss")'));
  }

  console.log("\n== 5) Hide Play Store / empty APK ==");
  {
    const page = clone(DEFAULT_PUBG_APK_PAGE);
    page.heroButtons.playStore.visible = false;
    page.heroButtons.apk = { label: "APK", href: E2E_APK, visible: true };
    await savePubgApkPage(page);
    const pub = await fetchText("/pubg-apk");
    const playAnchor = /<a class="ff-as-apk-btn" href="https:\/\/play\.google\.com/.test(pub.text);
    ok("Play Store CTA gone", !playAnchor, playAnchor ? "play store <a> still rendered" : "");
    ok("APK CTA still on", pub.text.includes(E2E_APK) && pub.text.includes("ff-as-apk-btn--alt"));

    page.heroButtons.apk = { label: "APK", href: "", visible: true };
    page.heroButtons.playStore.visible = true;
    await savePubgApkPage(page);
    const pub2 = await fetchText("/pubg-apk");
    ok("empty APK href hides APK button again", !pub2.text.includes("ff-as-apk-btn--alt"));
    ok("Play Store back", pub2.text.includes("com.tencent.ig"));
  }

  console.log("\n== 6) Isolation vs Lite + BGMI APK ==");
  {
    const page = clone(DEFAULT_PUBG_APK_PAGE);
    page.seoTitle = E2E_SEO;
    page.heroButtons.apk = { label: "APK", href: E2E_APK, visible: true };
    await savePubgApkPage(page);

    const lite = await fetchText("/pubg-mobile-lite-apk");
    ok("lite still 200", lite.status === 200);
    ok("lite no e2e SEO", !lite.text.includes(E2E_SEO));
    ok("lite no e2e apk url", !lite.text.includes("e2e-pubg-apk-check.apk"));

    const bgmi = await fetchText("/bgmi-apk");
    ok("bgmi apk no e2e SEO", !bgmi.text.includes(E2E_SEO));
    ok("bgmi apk still India listing", bgmi.text.includes("com.pubg.imobile") || bgmi.text.includes("BGMI APK"));
  }

  console.log("\n== 7) Comments API ==");
  {
    const bad = await fetch(`${BASE}/api/page-comments?pageKey=not-a-real-page`);
    ok("unknown pageKey GET 400", bad.status === 400);

    const getOk = await fetch(`${BASE}/api/page-comments?pageKey=${PUBG_APK_PAGE_KEY}`);
    const getJson = await getOk.json();
    ok("GET comments 200 + array", getOk.status === 200 && Array.isArray(getJson.data), `status=${getOk.status}`);

    const post = await fetch(`${BASE}/api/page-comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageKey: PUBG_APK_PAGE_KEY,
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

    const pub = await fetchText("/pubg-apk");
    ok("pending comment not on public list", !pub.text.includes("E2E comment for PUBG APK"));
  }

  console.log("\n== 8) Reset / restore defaults ==");
  {
    await clearPubgApkPage();
    const pub = await fetchText("/pubg-apk");
    ok("after reset 200", pub.status === 200);
    ok("after reset e2e SEO gone", !pub.text.includes(E2E_SEO));
    ok("after reset e2e apk gone", !pub.text.includes("e2e-pubg-apk-check.apk"));
    ok("after reset countdown hidden", !pub.text.includes("ff-as-countdown"));
    ok("after reset Play Store back", pub.text.includes("com.tencent.ig"));
    ok("default APK button hidden", !pub.text.includes("ff-as-apk-btn--alt"));
  }

  console.log("\n== 9) Sitemap + robots ==");
  {
    const sm = await fetchText("/sitemap-pages.xml");
    ok("sitemap-pages lists /pubg-apk", sm.status === 200 && sm.text.includes("/pubg-apk"));
    ok("sitemap still lists lite apk", sm.text.includes("/pubg-mobile-lite-apk"));
    ok("sitemap still lists bgmi apk", sm.text.includes("/bgmi-apk"));

    const idx = await fetchText("/sitemap.xml");
    ok("sitemap index points to pages", idx.status === 200 && idx.text.includes("sitemap-pages.xml"));

    const robots = await fetchText("/robots.txt");
    ok("robots allow /", robots.status === 200 && robots.text.includes("Allow: /"));
    ok("robots does not disallow /pubg-apk", !robots.text.includes("Disallow: /pubg-apk"));
  }

  console.log("\n== 10) Defaults / wiring sanity ==");
  {
    ok("default Play Store is global PUBG", String(PUBG_PLAY_STORE_URL).includes("com.tencent.ig"));
    ok("pageKey pubg-apk", PUBG_APK_PAGE_KEY === "pubg-apk");
    ok("default apk href empty", DEFAULT_PUBG_APK_PAGE.heroButtons.apk.href === "");
    ok("default countdown hidden", DEFAULT_PUBG_APK_PAGE.countdown.visible === false);
    ok("default countdown no date", DEFAULT_PUBG_APK_PAGE.countdown.targetIso === "");
  }
} catch (err) {
  ok("e2e threw", false, err instanceof Error ? err.message : String(err));
} finally {
  await restore();
  console.log("\nDB restored.");
}

if (failures.length) {
  console.log(`\nFAILED (${failures.length}): ${failures.join(", ")}`);
  process.exit(1);
}
console.log("\nAll PUBG APK e2e checks passed.");
