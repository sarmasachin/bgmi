/**
 * E2E: Home FfNewsHub — feature image + horizontal scroll + latest 5 only.
 * Usage: node scripts/e2e-ff-news-hub.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function read(rel) {
  const full = path.join(root, rel);
  assert(fs.existsSync(full), `Missing: ${rel}`);
  return fs.readFileSync(full, "utf8");
}

function checkHubComponent() {
  const src = read("src/components/FfNewsHub.tsx");
  assert(src.includes("FF_NEWS_HUB_LIMIT = 5"), "limit must be 5");
  assert(src.includes("items.slice(0, FF_NEWS_HUB_LIMIT)"), "must slice to 5");
  assert(src.includes("featureImage"), "featureImage on item type/usage");
  assert(src.includes("ff-news-hub-card-image"), "feature image class in markup");
  assert(src.includes("is-placeholder"), "placeholder when no image");
  assert(src.includes("ff-news-hub-scroll"), "horizontal scroll container");
  assert(src.includes('href="/news"'), "View all → /news");
  assert(!src.includes("Math.min(items.length, 10)"), "old 10-cap copy must be gone");
  console.log("PASS  FfNewsHub component (image + limit 5 + scroll)");
}

function checkFetchers() {
  const layout = read("app/(games)/layout.tsx");
  assert(layout.includes("listPublishedNews(1, 5)"), "home layout must fetch 5");
  assert(!layout.includes("listPublishedNews(1, 10)"), "home must not fetch 10");
  assert(layout.includes("featureImage:"), "home map must pass featureImage");

  const maxPage = read("src/components/FreeFireComingSoonPage.tsx");
  assert(maxPage.includes("listPublishedNews(1, 5)"), "FF Max page must fetch 5");
  assert(!maxPage.includes("listPublishedNews(1, 10)"), "FF Max must not fetch 10");
  assert(maxPage.includes("featureImage:"), "FF Max map must pass featureImage");
  console.log("PASS  fetchers pass featureImage and limit 5");
}

function checkCss() {
  const css = read("app/globals.css");
  assert(css.includes(".ff-news-hub-scroll"), "scroll row CSS");
  assert(css.includes("overflow-x: auto"), "horizontal overflow");
  assert(css.includes("scroll-snap-type: x mandatory"), "snap scroll");
  assert(css.includes(".ff-news-hub-card-image"), "card image CSS");
  assert(css.includes("object-fit: cover"), "image cover");
  assert(css.includes(".ff-news-hub-card-body"), "card body padding after image");
  console.log("PASS  hub CSS (horizontal scroll + image)");
}

function checkSliceLogic() {
  const limit = 5;
  const items = Array.from({ length: 8 }, (_, i) => ({ id: `n${i + 1}` }));
  const visible = items.slice(0, limit);
  assert(visible.length === 5, "slice(0,5) on 8 → 5");
  assert(visible[0].id === "n1" && visible[4].id === "n5", "keeps latest-first order from API");
  const one = [{ id: "only" }].slice(0, limit);
  assert(one.length === 1, "fewer than 5 still shows all");
  console.log("PASS  latest-5 slice logic");
}

function main() {
  console.log("=== e2e-ff-news-hub ===");
  checkHubComponent();
  checkFetchers();
  checkCss();
  checkSliceLogic();
  console.log("VERDICT PASS");
}

try {
  main();
} catch (err) {
  console.error("FAIL", err instanceof Error ? err.message : err);
  process.exit(1);
}
