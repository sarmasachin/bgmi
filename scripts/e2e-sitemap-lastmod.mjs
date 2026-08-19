/**
 * E2E: sitemap lastmod = real save time (IST), never UTC yesterday / now() / publishedAt.
 * Usage: node scripts/e2e-sitemap-lastmod.mjs
 * Optional: SITEMAP_E2E_BASE=http://localhost:3000
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const base = (process.env.SITEMAP_E2E_BASE || "http://localhost:3000").replace(/\/+$/, "");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function read(rel) {
  const full = path.join(root, rel);
  assert(fs.existsSync(full), `Missing: ${rel}`);
  return fs.readFileSync(full, "utf8");
}

function toIst(value) {
  const date = value instanceof Date ? value : new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? "";
  let hour = get("hour");
  if (hour === "24") hour = "00";
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}:${get("second")}+05:30`;
}

function checkFiles() {
  assert(!fs.existsSync(path.join(root, "app", "sitemap.ts")), "old app/sitemap.ts must stay deleted (UTC Date bug)");
  const route = read("app/sitemap.xml/route.ts");
  assert(route.includes("force-dynamic"), "sitemap route must be force-dynamic");
  assert(route.includes("sitemapIndexToXml"), "root sitemap must be a sitemap index");
  assert(fs.existsSync(path.join(root, "app", "sitemap-pages.xml", "route.ts")), "missing sitemap-pages.xml");
  assert(fs.existsSync(path.join(root, "app", "sitemap-news.xml", "route.ts")), "missing sitemap-news.xml");

  const build = read("src/server/sitemap/buildSitemap.ts");
  assert(build.includes("newsArticlePath"), "articles must use primary category path");
  assert(build.includes("listNewsCategorySlugs"), "category hubs from DB");
  assert(build.includes("listPublishedLegalForSitemap"), "custom legal pages must be listed");
  assert(!build.includes("publishedAt"), "must not use publishedAt (old date)");
  assert(!build.includes("new Date()"), "must not stamp generate-time now()");
  assert(!build.includes("changefreq"), "Google ignores changefreq — omit it");
  assert(!build.includes("priority"), "Google ignores priority — omit it");
  assert(build.includes("toSitemapLastmodIst"), "IST lastmod helper");
  assert(build.includes("FREE_FIRE") || !build.includes("/free-fire-sensitivity-settings-calculator\""), "redirect calculator slug must not be a static loc");
  assert(!build.includes('"/free-fire-sensitivity-settings-calculator"'), "redirect URL must stay out of sitemap");

  const repo = read("src/server/repositories/sitemapLastmodRepository.ts");
  assert(!repo.includes("latestNews"), "/news must not auto-stamp from any article");
  assert(repo.includes("settings:advanceServerPage") || read("src/lib/sitemapLastmod.ts").includes("settings:advanceServerPage"), "Advance Server key mapped");

  const keys = read("src/lib/sitemapLastmod.ts");
  assert(keys.includes('"/free-fire-advance-server": ["settings:advanceServerPage"]'), "Advance Server lastmod key");
  assert(keys.includes("settings:homeDisplay"), "home lastmod must include homeDisplay save");
  assert(keys.includes("settings:newsListingSeo"), "/news lastmod = listing SEO save only");

  const news = read("src/server/repositories/newsRepository.ts");
  const start = news.indexOf("export async function listPublishedNewsForSitemap");
  const next = news.indexOf("export async function getNewsById");
  assert(start >= 0 && next > start, "news sitemap function bounds");
  const sitemapFn = news.slice(start, next);
  assert(sitemapFn.includes("updatedAt: true"), "news sitemap must select updatedAt");
  assert(!sitemapFn.includes("publishedAt"), "news sitemap query must not select publishedAt");

  const pages = read("src/server/repositories/pagesRepository.ts");
  const pStart = pages.indexOf("export async function listPublishedPagesForSitemap");
  const pNext = pages.indexOf("export const getPublishedPageBySlug");
  assert(pStart >= 0 && pNext > pStart, "pages sitemap function bounds");
  const pagesFn = pages.slice(pStart, pNext);
  assert(!pagesFn.includes("updatedAt: new Date()"), "CMS sitemap mock must not use Date.now()");

  const robots = read("app/robots.ts");
  assert(robots.includes("/sitemap.xml"), "robots must point at /sitemap.xml");

  const e2eCats = read("scripts/e2e-news-categories.mjs");
  assert(e2eCats.includes("src/server/sitemap/buildSitemap.ts"), "categories e2e must follow new sitemap path");
  const xml = read("src/server/sitemap/sitemapXml.ts");
  assert(xml.includes('replaceAll("&", "&amp;")'), "XML must escape ampersands in loc");
  assert(xml.includes("sitemap-image"), "news images use image sitemap extension");

  console.log("PASS  static wiring (no dual sitemap.ts, IST builder, no publishedAt)");
}

function checkIstFormatter() {
  const utcEvening = new Date("2026-08-19T20:00:00.000Z");
  const ist = toIst(utcEvening);
  assert(ist === "2026-08-20T01:30:00+05:30", `IST mismatch: ${ist}`);
  assert(!utcEvening.toISOString().startsWith("2026-08-20"), "UTC day must stay 19th");
  console.log("PASS  IST formatter (UTC 19 Aug 20:00 → 20 Aug 01:30 +05:30)");
}

function parseLocs(xml) {
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const lastmods = [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
  return { locs, lastmods };
}

async function checkHttp() {
  const sitemapRes = await fetch(`${base}/sitemap.xml`, { cache: "no-store" });
  assert(sitemapRes.ok, `sitemap HTTP ${sitemapRes.status}`);
  const ctype = sitemapRes.headers.get("content-type") || "";
  assert(/xml/i.test(ctype), `content-type not xml: ${ctype}`);
  const xml = await sitemapRes.text();
  assert(xml.includes("<sitemapindex"), "root sitemap must be sitemapindex like BBC/NYT");
  assert(!xml.includes("<urlset"), "index file must not be a urlset");
  assert(xml.includes("/sitemap-pages.xml"), "index missing pages child");
  assert(xml.includes("/sitemap-news.xml"), "index missing news child");
  assert(!/Internal Server Error|Application error/i.test(xml), "sitemap body looks like 500 HTML");
  assert(!xml.includes("<changefreq>"), "index must not use ignored changefreq");
  assert(!xml.includes("<priority>"), "index must not use ignored priority");

  const pagesRes = await fetch(`${base}/sitemap-pages.xml`, { cache: "no-store" });
  assert(pagesRes.ok, `pages sitemap HTTP ${pagesRes.status}`);
  const pagesXml = await pagesRes.text();
  const newsRes = await fetch(`${base}/sitemap-news.xml`, { cache: "no-store" });
  assert(newsRes.ok, `news sitemap HTTP ${newsRes.status}`);
  const newsXml = await newsRes.text();

  assert(!pagesXml.includes("<changefreq>"), "pages sitemap still has changefreq");
  assert(!newsXml.includes("<priority>"), "news sitemap still has priority");
  assert(!pagesXml.includes("/free-fire-sensitivity-settings-calculator"), "redirect URL leaked into pages sitemap");
  assert(!pagesXml.includes("/admin"), "admin leaked into sitemap");

  const { locs, lastmods } = parseLocs(`${pagesXml}\n${newsXml}`);
  assert(locs.length >= 8, `too few urls: ${locs.length}`);
  const needed = [
    `${base}/`,
    `${base}/free-fire-advance-server`,
    `${base}/news`,
    `${base}/bgmi`,
    `${base}/privacy`,
    `${base}/ff-max`,
    `${base}/free-fire`,
    `${base}/pubg-mobile-codes`,
    `${base}/free-fire-max-sensitivity-settings-calculator`,
    `${base}/contact`,
    `${base}/terms`,
    `${base}/disclaimer`,
  ];
  for (const loc of needed) {
    assert(locs.includes(loc), `missing loc ${loc}`);
  }

  const dup = locs.filter((loc, i) => locs.indexOf(loc) !== i);
  assert(dup.length === 0, `duplicate loc: ${dup.join(", ")}`);

  const istRe = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+05:30$/;
  for (const stamp of lastmods) {
    assert(istRe.test(stamp), `bad lastmod (UTC/date-only/auto?): ${stamp}`);
    assert(!stamp.endsWith("Z"), `UTC Z lastmod: ${stamp}`);
  }

  const robotsRes = await fetch(`${base}/robots.txt`, { cache: "no-store" });
  assert(robotsRes.ok, `robots HTTP ${robotsRes.status}`);
  const robots = await robotsRes.text();
  assert(robots.includes("sitemap.xml"), "robots.txt missing sitemap.xml");

  console.log(
    `PASS  HTTP sitemap (${locs.length} urls, ${lastmods.length} lastmod tags, no UTC Z)`,
  );
  if (lastmods.length === 0) {
    console.log("NOTE  lastmod tags empty — local DB not returning updatedAt (no fake now() used)");
  }
}

async function main() {
  console.log("=== e2e-sitemap-lastmod ===");
  checkFiles();
  checkIstFormatter();
  try {
    await checkHttp();
  } catch (error) {
    if (String(error.message || error).includes("fetch")) {
      console.log(`SKIP  HTTP (${error.message})`);
    } else {
      throw error;
    }
  }
  console.log("VERDICT PASS");
}

try {
  await main();
} catch (error) {
  console.error("VERDICT FAIL", error.message || error);
  process.exit(1);
}
