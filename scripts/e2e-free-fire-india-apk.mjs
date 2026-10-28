/**
 * E2E: /free-fire-india-apk mirrors /free-fire-apk content with the Free Fire India name.
 * Usage: npx tsx scripts/e2e-free-fire-india-apk.mjs
 * Optional HTTP: FF_INDIA_E2E_BASE=http://127.0.0.1:3000
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_FREE_FIRE_APK_PAGE } from "../src/lib/freeFireApkPage.ts";
import { normalizeFreeFireApkPage } from "../src/lib/freeFireApkPageNormalize.ts";
import {
  FREE_FIRE_INDIA_APK_GUIDE_ID,
  FREE_FIRE_INDIA_APK_PAGE_KEY,
  toFreeFireIndiaApkPage,
} from "../src/lib/freeFireIndiaApkPage.ts";
import { FREE_FIRE_INDIA_APK_PATH, isFreeFireIndiaPath } from "../src/lib/gamePagePath.ts";
import { FREE_FIRE_FAMILY_NAV, isFreeFireFamilyPath } from "../src/lib/freeFirePages.ts";
import { isFreeFireMaxFamilyPath } from "../src/lib/freeFireMaxPages.ts";
import { detectNavGameContext, resolveNavForPath } from "../src/lib/resolveNavForPath.ts";
import { RESERVED_PUBLIC_SLUGS } from "../src/lib/reservedPublicSlugs.ts";
import { SITEMAP_PATH_CONTENT_KEYS, SITEMAP_STATIC_PATHS } from "../src/lib/sitemapLastmod.ts";
import { SITE_GAME_NAV } from "../src/lib/siteGameNav.ts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = (process.env.FF_INDIA_E2E_BASE || "").replace(/\/+$/, "");
const fails = [];

function assert(cond, msg) {
  if (!cond) fails.push(msg);
  else console.log(`  OK  ${msg}`);
}

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const full = path.join(root, file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match || process.env[match[1]]) continue;
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[match[1]] = value;
    }
  }
}

function walkStrings(value, visit, trail = "") {
  if (typeof value === "string") {
    visit(trail, value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, visit, `${trail}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      walkStrings(child, visit, trail ? `${trail}.${key}` : key);
    }
  }
}

function bareFreeFireHits(page) {
  const hits = [];
  walkStrings(page, (trail, text) => {
    if (/Free Fire India India/.test(text)) hits.push(`${trail}: doubled India`);
    const bare = text.match(/Free Fire(?! India\b| MAX\b| Max\b)/g);
    if (bare) hits.push(`${trail}: ${bare.join(", ")} :: ${text.slice(0, 140)}`);
  });
  return hits;
}

function sameShape(source, india) {
  assert(india.path === FREE_FIRE_INDIA_APK_PATH, `path is ${FREE_FIRE_INDIA_APK_PATH}`);
  assert(india.cards.length === source.cards.length, `card count ${source.cards.length}`);
  assert(
    india.cards.every((card, index) => card.id === source.cards[index].id),
    "card ids stay aligned with Free Fire APK",
  );
  assert(india.faqs.length === source.faqs.length, `faq count ${source.faqs.length}`);
  assert(india.pills.length === source.pills.length, `pill count ${source.pills.length}`);
  assert(india.facts.rows.length === source.facts.rows.length, "facts row count");
  assert(india.preRegister.steps.length === source.preRegister.steps.length, "install step count");
  assert(india.heroButtons.playStore.href === source.heroButtons.playStore.href, "Play Store URL unchanged");
  assert(india.heroButtons.playStore.visible === source.heroButtons.playStore.visible, "Play Store visibility unchanged");
  assert(india.heroButtons.apk.href === source.heroButtons.apk.href, "APK URL unchanged");
  assert(india.heroButtons.apk.visible === source.heroButtons.apk.visible, "APK visibility unchanged");
  assert(india.heroImage === source.heroImage, "hero image unchanged");
  assert(!india.articleHtml.includes("#free-fire-apk-guide"), "article guide links retargeted");
  assert(
    !india.preRegister.guideHref.includes("#free-fire-apk-guide"),
    "install guide link retargeted",
  );
  assert(
    india.preRegister.guideHref.includes(`#${FREE_FIRE_INDIA_APK_GUIDE_ID}`) ||
      source.preRegister.guideHref.includes("#free-fire-apk-guide") === false,
    "install guide points at the India section when the source did",
  );
  const hits = bareFreeFireHits(india);
  assert(hits.length === 0, hits.length ? `no bare Free Fire left (${hits[0]})` : "no bare Free Fire left");
  const packed = JSON.stringify(india);
  assert(!packed.includes("FF Apk") && !packed.includes("FF APK") && !packed.includes("FF apk"), "short FF Apk name is also Free Fire India APK");
  assert(india.heroTitle.includes("Free Fire India"), `hero title renamed (${india.heroTitle})`);
  assert(india.seoTitle.includes("Free Fire India"), `seo title renamed (${india.seoTitle})`);
  assert(/Free Fire MAX|Free Fire Max/.test(JSON.stringify(source)) === /Free Fire MAX|Free Fire Max/.test(JSON.stringify(india)), "MAX name preserved when present");
}

function wiringSuite() {
  console.log("=== wiring ===");
  assert(RESERVED_PUBLIC_SLUGS.has("free-fire-india-apk"), "slug reserved");
  assert(SITEMAP_STATIC_PATHS.includes(FREE_FIRE_INDIA_APK_PATH), "sitemap static path");
  assert(
    (SITEMAP_PATH_CONTENT_KEYS[FREE_FIRE_INDIA_APK_PATH] || []).includes("settings:freeFireApkPage"),
    "sitemap lastmod uses the Free Fire APK setting",
  );
  assert(isFreeFireFamilyPath(FREE_FIRE_INDIA_APK_PATH), "Free Fire family menu");
  assert(isFreeFireFamilyPath(`${FREE_FIRE_INDIA_APK_PATH}/`), "trailing slash still family");
  assert(!isFreeFireIndiaPath(FREE_FIRE_INDIA_APK_PATH), "APK URL is not the India calculator");
  assert(!isFreeFireMaxFamilyPath(FREE_FIRE_INDIA_APK_PATH), "not the MAX family");
  assert(isFreeFireFamilyPath("/free-fire-apk"), "original APK page still Free Fire family");
  assert(isFreeFireMaxFamilyPath("/free-fire-max-apk"), "MAX APK still MAX family");
  assert(detectNavGameContext(FREE_FIRE_INDIA_APK_PATH) === "freefire", "nav context is freefire");
  const menu = resolveNavForPath(FREE_FIRE_INDIA_APK_PATH, []);
  assert(
    menu.some((item) => item.href === FREE_FIRE_INDIA_APK_PATH && item.label === "FF India APK"),
    "page menu includes FF India APK",
  );
  assert(
    FREE_FIRE_FAMILY_NAV.some((item) => item.href === FREE_FIRE_INDIA_APK_PATH),
    "family nav includes the page",
  );
  const header = SITE_GAME_NAV.find((item) => item.id === "free-fire");
  assert(
    header?.children?.some((item) => item.href === FREE_FIRE_INDIA_APK_PATH),
    "site header Free Fire submenu includes the page",
  );
  const comments = fs.readFileSync(path.join(root, "app/api/page-comments/route.ts"), "utf8");
  assert(comments.includes("FREE_FIRE_INDIA_APK_PAGE_KEY"), "comments API allows the page key");
  assert(FREE_FIRE_INDIA_APK_PAGE_KEY === "free-fire-india-apk", "comment page key");
  const build = fs.readFileSync(path.join(root, "src/server/sitemap/buildSitemap.ts"), "utf8");
  assert(build.includes('"/free-fire-india-apk"'), "pages sitemap lists the URL");
  const pageFile = fs.readFileSync(path.join(root, "app/free-fire-india-apk/page.tsx"), "utf8");
  assert(pageFile.includes("FreeFireIndiaApkLandingPage"), "route renders the landing page");
  const landing = fs.readFileSync(path.join(root, "src/components/FreeFireApkLandingPage.tsx"), "utf8");
  assert(landing.includes("id={meta.guideId}"), "guide section id follows the variant");
  assert(landing.includes('variant="india"'), "India landing variant exists");
  assert(landing.includes('variant="freefire"'), "original APK landing still exists");
}

function defaultSuite() {
  console.log("=== default content ===");
  sameShape(DEFAULT_FREE_FIRE_APK_PAGE, toFreeFireIndiaApkPage(DEFAULT_FREE_FIRE_APK_PAGE));
}

async function dbSuite() {
  console.log("=== saved Free Fire APK content ===");
  loadEnv();
  if (!process.env.DATABASE_URL) {
    console.log("  SKIP  no DATABASE_URL");
    return;
  }
  const prisma = new PrismaClient();
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: "settings:freeFireApkPage" } });
    if (!row?.value) {
      console.log("  SKIP  settings:freeFireApkPage is empty; public page uses defaults");
      return;
    }
    const source = normalizeFreeFireApkPage(row.value);
    const india = toFreeFireIndiaApkPage(source);
    console.log(`  hero  ${source.heroTitle}  ->  ${india.heroTitle}`);
    sameShape(source, india);
  } finally {
    await prisma.$disconnect();
  }
}

async function httpSuite() {
  if (!base) {
    console.log("=== http ===");
    console.log("  SKIP  set FF_INDIA_E2E_BASE to render the page");
    return;
  }
  console.log(`=== http ${base} ===`);
  const res = await fetch(`${base}/free-fire-india-apk`, { redirect: "manual" });
  const html = await res.text();
  assert(res.status === 200, `GET /free-fire-india-apk status ${res.status}`);
  assert(html.includes("free-fire-india-apk-hero-title"), "hero heading id");
  assert(html.includes(`id="${FREE_FIRE_INDIA_APK_GUIDE_ID}"`), "guide anchor");
  assert(html.includes("Free Fire India"), "visible Free Fire India name");
  assert(!html.includes("Free Fire India India"), "name is not doubled");
  assert(html.includes("FF India APK"), "breadcrumb or menu label");
  assert(html.includes(`"targetId":"free-fire-india-apk"`) || html.includes("free-fire-india-apk"), "page key present");
  assert(!html.includes('id="free-fire-apk-guide"'), "does not use the Free Fire APK guide id");
  const ff = await fetch(`${base}/free-fire-apk`, { redirect: "manual" });
  const ffHtml = await ff.text();
  assert(ff.status === 200, `GET /free-fire-apk still ${ff.status}`);
  assert(ffHtml.includes("free-fire-apk-hero-title"), "original APK hero id unchanged");
  const indiaTitle = html.match(/id="free-fire-india-apk-hero-title"[^>]*>([^<]+)</)?.[1] ?? "";
  const ffTitle = ffHtml.match(/id="free-fire-apk-hero-title"[^>]*>([^<]+)</)?.[1] ?? "";
  assert(indiaTitle.includes("Free Fire India"), `India h1 is ${indiaTitle || "(missing)"}`);
  assert(ffTitle.includes("Free Fire") && !ffTitle.includes("Free Fire India"), `original h1 stays ${ffTitle || "(missing)"}`);
}

wiringSuite();
defaultSuite();
await dbSuite();
await httpSuite();

if (fails.length) {
  console.error("\nFAIL");
  for (const msg of fails) console.error(`  - ${msg}`);
  process.exit(1);
}
console.log("\nPASS  free fire india apk");
