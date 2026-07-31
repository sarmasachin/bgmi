/**
 * In-memory CRUD for news categories (no Postgres / no Next react.cache).
 * Mirrors newsRepository create/update/delete + hub listing rules.
 * Usage: npx tsx scripts/e2e-news-categories-repo.mjs
 */
import {
  coerceNewsCategory,
  newsArticlePath,
  normalizeExtraCategories,
} from "../src/lib/newsCategories.ts";
import { mockStore } from "../src/server/mockStore.ts";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function belongs(item, category) {
  const primary = coerceNewsCategory(item.primaryCategory);
  if (primary === category) return true;
  return normalizeExtraCategories(primary, item.extraCategories).includes(category);
}

function createNews(input) {
  const primaryCategory = coerceNewsCategory(input.primaryCategory);
  const extraCategories = normalizeExtraCategories(primaryCategory, input.extraCategories);
  const item = {
    id: `n${Date.now()}`,
    title: input.title,
    slug: input.slug,
    status: input.status,
    primaryCategory,
    extraCategories,
    excerpt: input.excerpt ?? "",
    content: { html: input.content ?? "" },
  };
  mockStore.news.unshift(item);
  return item;
}

function updateNews(input) {
  const item = mockStore.news.find((n) => n.id === input.id);
  if (!item) return null;
  const primaryCategory = coerceNewsCategory(input.primaryCategory);
  const extraCategories = normalizeExtraCategories(primaryCategory, input.extraCategories);
  item.title = input.title;
  item.slug = input.slug;
  item.primaryCategory = primaryCategory;
  item.extraCategories = extraCategories;
  if (input.status) item.status = input.status;
  return item;
}

function deleteNews(id) {
  const index = mockStore.news.findIndex((n) => n.id === id);
  if (index === -1) return false;
  mockStore.news.splice(index, 1);
  return true;
}

function listAll() {
  return mockStore.news.filter((n) => n.status === "published");
}

function listCat(category) {
  return listAll().filter((n) => belongs(n, category));
}

async function main() {
  console.log("=== e2e-news-categories-repo (mockStore) ===");
  const stamp = Date.now();
  const slug = `e2e-repo-cat-${stamp}`;
  const prev = mockStore.news.slice();
  mockStore.news = [];
  let id = null;

  try {
    console.log("1) create primary=ff-max extra=[free-fire,ff-max]");
    const created = createNews({
      title: `Repo Cat ${stamp}`,
      slug,
      excerpt: "repo e2e",
      content: "<p>hi</p>",
      status: "published",
      primaryCategory: "ff-max",
      extraCategories: ["free-fire", "ff-max"],
    });
    id = created.id;
    assert(created.primaryCategory === "ff-max", "primary on create");
    assert(
      JSON.stringify(created.extraCategories) === '["free-fire"]',
      `extras normalized, got ${JSON.stringify(created.extraCategories)}`,
    );
    assert(listAll().some((x) => x.id === id), "on /news");
    assert(listCat("ff-max").some((x) => x.id === id), "on /ff-max primary");
    assert(listCat("free-fire").some((x) => x.id === id), "on /free-fire extra");
    assert(newsArticlePath(created.primaryCategory, created.slug) === `/ff-max/${slug}`, "one URL");

    console.log("2) update primary→free-fire extras=[]");
    const updated = updateNews({
      id,
      title: `Repo Cat Updated ${stamp}`,
      slug,
      primaryCategory: "free-fire",
      extraCategories: [],
      status: "published",
    });
    assert(updated.primaryCategory === "free-fire", "primary updated");
    assert(updated.extraCategories.length === 0, "extras cleared");
    assert(newsArticlePath(updated.primaryCategory, updated.slug) === `/free-fire/${slug}`, "URL follows primary");
    assert(!listCat("ff-max").some((x) => x.id === id), "left /ff-max");
    assert(listCat("free-fire").some((x) => x.id === id), "on /free-fire");

    console.log("3) add extra ff-max (URL stays free-fire)");
    const again = updateNews({
      id,
      title: updated.title,
      slug,
      primaryCategory: "free-fire",
      extraCategories: ["ff-max"],
    });
    assert(again.primaryCategory === "free-fire", "primary stable");
    assert(JSON.stringify(again.extraCategories) === '["ff-max"]', "extra added");
    assert(newsArticlePath(again.primaryCategory, again.slug) === `/free-fire/${slug}`, "still one link");
    assert(listCat("ff-max").some((x) => x.id === id), "on /ff-max via extra");
    assert(listCat("free-fire").some((x) => x.id === id), "still on /free-fire primary");

    console.log("4) delete");
    assert(deleteNews(id) === true, "delete ok");
    id = null;
    assert(!listAll().some((x) => x.slug === slug), "gone");

    console.log("PASS  mock CRUD create/update/delete + hubs");
    console.log("VERDICT PASS");
  } finally {
    mockStore.news = prev;
  }
}

main().catch((err) => {
  console.error("FAIL", err instanceof Error ? err.message : err);
  process.exit(1);
});
