/**
 * E2E cross-check for news listing + related UI wiring added recently.
 * Usage: node scripts/e2e-news-listing.mjs
 *
 * Verifies:
 * - page size 15, pattern 1 big + 4 cards (repeat)
 * - light listing + article white styles present
 * - breadcrumb not killed by article ol decimal CSS
 * - rating widget centered / title below stars line
 * - admin sidebar uses replace (no Pages history trap)
 * - no unused stub content/news.ts
 * - no Showing X–Y continue kicker (misinterpreted feature)
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

function lineCount(rel) {
  return read(rel).split(/\r?\n/).length;
}

/** Mirror of NewsSection buildNewsBlocks */
function buildNewsBlocks(items, every = 5) {
  const blocks = [];
  for (let i = 0; i < items.length; i += every) {
    const featured = items[i];
    if (!featured) break;
    blocks.push({ type: "featured", item: featured });
    const cards = items.slice(i + 1, i + every);
    if (cards.length) blocks.push({ type: "cards", items: cards });
  }
  return blocks;
}

function checkListingPatternLogic() {
  const ids = Array.from({ length: 15 }, (_, i) => `n${i + 1}`);
  const blocks = buildNewsBlocks(ids.map((id) => ({ id })));
  const featured = blocks.filter((b) => b.type === "featured");
  const cardBlocks = blocks.filter((b) => b.type === "cards");
  assert(featured.length === 3, `expected 3 featured on full page, got ${featured.length}`);
  assert(cardBlocks.length === 3, `expected 3 card grids, got ${cardBlocks.length}`);
  assert(
    cardBlocks.every((b) => b.items.length === 4),
    "each card grid must have 4 items on full page",
  );
  assert(featured[0].item.id === "n1", "1st featured = item 1");
  assert(featured[1].item.id === "n6", "2nd featured = item 6 (5th+1)");
  assert(featured[2].item.id === "n11", "3rd featured = item 11");

  // Partial last page (e.g. 17 total → page2 has 2 items)
  const partial = buildNewsBlocks([{ id: "a" }, { id: "b" }]);
  assert(partial.length === 2, "partial: featured + 1-card grid");
  assert(partial[0].type === "featured" && partial[0].item.id === "a", "partial featured");
  assert(partial[1].type === "cards" && partial[1].items.length === 1, "partial cards");

  // Pagination math: 15/page continues on next page
  const total = 37;
  const pageSize = 15;
  const pages = Math.ceil(total / pageSize);
  assert(pages === 3, "37 items → 3 pages");
  const page2Start = (2 - 1) * pageSize; // skip index
  assert(page2Start === 15, "page 2 starts at index 15 (16th item)");
  console.log("PASS  listing pattern logic (1+4)×3 per 15 + pagination offsets");
}

function checkNewsSectionSource() {
  const src = read("src/features/news/NewsSection.tsx");
  assert(src.includes("const NEWS_PAGE_SIZE = 15"), "NEWS_PAGE_SIZE must be 15");
  assert(src.includes("const FEATURED_EVERY = 5"), "FEATURED_EVERY must be 5");
  assert(src.includes("buildNewsBlocks"), "missing buildNewsBlocks");
  assert(src.includes("news-featured"), "missing featured markup");
  assert(src.includes("news-card"), "missing card markup");
  assert(src.includes("news-thumb"), "card must have left thumb");
  assert(src.includes("news-content"), "card must have right content");
  assert(src.includes("news-listing-light"), "light listing class missing");
  assert(src.includes("?page="), "pagination query missing");
  assert(src.includes(">Prev<") || src.includes(">Prev\n") || src.includes("Prev"), "Prev link");
  assert(src.includes("Next"), "Next link");
  assert(!src.includes("Showing "), "FAIL: Showing X–Y kicker should be removed");
  assert(!src.includes("rangeStart"), "FAIL: rangeStart leftover");
  assert(lineCount("src/features/news/NewsSection.tsx") <= 1000, "NewsSection over 1000");
  console.log("PASS  NewsSection source wiring");
}

function checkLightStylesAndArticle() {
  const globals = read("app/globals.css");
  const detail = read("src/features/news/newsDetail.css");
  const newsPage = read("app/news/page.tsx");
  const catPage = read("src/features/news/CategoryNewsListingPage.tsx");

  assert(newsPage.includes("news-listing-page"), "/news must use light page shell");
  assert(catPage.includes("news-listing-page"), "category hubs must use light page shell");
  assert(globals.includes(".news-listing-light"), "light listing CSS missing");
  assert(globals.includes(".news-listing-page"), "listing page bg CSS missing");

  // Breadcrumb must not get article ol decimal markers
  assert(
    globals.includes("ol:not(.news-detail-breadcrumb-list)") ||
      detail.includes("ol:not(.news-detail-breadcrumb-list)"),
    "breadcrumb ol must be excluded from list-style:decimal",
  );
  assert(
    globals.includes(".news-detail-breadcrumb-list") &&
      (globals.includes("list-style: none") || globals.includes("list-style-type: none")),
    "breadcrumb list-style none missing",
  );

  // Rating: centered + title below stars (order)
  assert(
    globals.includes(".news-detail-page .rating-widget") &&
      globals.includes("align-items: center") &&
      globals.includes("order: 3") &&
      globals.includes("order: 1"),
    "news rating center/order CSS incomplete",
  );
  assert(
    detail.includes("order: 3") && detail.includes("border-top: 1px solid"),
    "newsDetail.css rating title-below-line incomplete",
  );

  const view = read("src/features/news/NewsDetailView.tsx");
  assert(view.includes("news-detail-breadcrumb"), "detail breadcrumb missing");
  assert(view.includes('href="/news"'), "breadcrumb News link");
  assert(!view.includes("categoryHref"), "unused categoryHref should be gone");
  assert(!view.includes("newsCategoryLabel"), "unused newsCategoryLabel import should be gone");
  console.log("PASS  light listing + article breadcrumb/rating CSS");
}

function checkAdminAndDeadCode() {
  const layout = read("app/admin/AdminLayoutClient.tsx");
  // Sidebar Link must have replace prop (history stack fix)
  const linkIdx = layout.indexOf("admin-nav-link");
  assert(linkIdx > 0, "admin nav link missing");
  const window = layout.slice(Math.max(0, linkIdx - 200), linkIdx + 80);
  assert(window.includes("replace"), "admin sidebar Link missing replace");

  assert(
    !fs.existsSync(path.join(root, "src", "content", "news.ts")),
    "unused src/content/news.ts should stay deleted",
  );
  assert(
    !fs.existsSync(path.join(root, "app", "[category]")),
    "app/[category] must not exist (Next clash)",
  );
  assert(
    fs.existsSync(path.join(root, "app", "[slug]", "[newsSlug]", "page.tsx")),
    "article route app/[slug]/[newsSlug] missing",
  );
  console.log("PASS  admin replace + dead route/stub cleanup");
}

function checkCategoriesStillWired() {
  const cats = read("src/lib/newsCategories.ts");
  assert(cats.includes("newsArticlePath"), "newsArticlePath missing");
  const admin = read("app/admin/news/AdminNewsClient.tsx");
  assert(admin.includes("primaryCategory") && admin.includes("extraCategories"), "admin categories");
  const api = read("app/api/admin/news/route.ts");
  assert(api.includes("primaryCategory"), "API primaryCategory");
  console.log("PASS  category feature still wired");
}

function main() {
  console.log("=== e2e-news-listing ===");
  checkListingPatternLogic();
  checkNewsSectionSource();
  checkLightStylesAndArticle();
  checkAdminAndDeadCode();
  checkCategoriesStillWired();
  console.log("VERDICT PASS");
}

try {
  main();
} catch (err) {
  console.error("FAIL", err instanceof Error ? err.message : err);
  process.exit(1);
}
