/**
 * E2E: category slug typing + public URL uniqueness (category / page / static routes).
 * Usage: npx tsx scripts/e2e-public-url-uniqueness.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import {
  categoryListingOccupiesTopSlug,
  formatCategorySlugDraft,
  newsCategoryListingPath,
  normalizeCategorySlugInput,
} from "../src/lib/newsCategories.ts";
import { RESERVED_PUBLIC_SLUGS, isReservedPublicSlug } from "../src/lib/reservedPublicSlugs.ts";
import {
  findCategoryPublicSlugConflict,
  findPagePublicSlugConflict,
} from "../src/server/publicUrlConflicts.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  for (const f of [".env.local", ".env"]) {
    const p = path.join(root, f);
    if (!fs.existsSync(p)) continue;
    for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!m) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[m[1]]) process.env[m[1]] = v;
    }
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function lineCount(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8").split(/\r?\n/).length;
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function collectStaticTopSlugs() {
  const slugs = new Set();
  function walk(abs, urlParts) {
    const entries = fs.readdirSync(abs, { withFileTypes: true });
    const hasPage = entries.some((e) => e.isFile() && /^page\.(tsx|ts|jsx|js)$/.test(e.name));
    if (hasPage && urlParts.length >= 1) {
      const top = urlParts[0];
      if (top !== "admin" && !top.startsWith("[")) slugs.add(top);
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith("@") || entry.name === "api") continue;
      const grouped = entry.name.startsWith("(") && entry.name.endsWith(")");
      const next = grouped ? urlParts : [...urlParts, entry.name];
      walk(path.join(abs, entry.name), next);
    }
  }
  walk(path.join(root, "app"), []);
  return slugs;
}

function helperSuite() {
  assert(formatCategorySlugDraft("bgmi ") === "bgmi-", "space after word must stay as trailing hyphen");
  assert(formatCategorySlugDraft("BGMI Lite") === "bgmi-lite", "spaces become hyphens");
  assert(formatCategorySlugDraft("bgmi-") === "bgmi-", "trailing hyphen kept while typing");
  assert(normalizeCategorySlugInput("bgmi-") === "bgmi", "submit strips trailing hyphen");
  assert(normalizeCategorySlugInput(" BGMI Lite ") === "bgmi-lite", "submit compact slug");
  assert(newsCategoryListingPath("bgmi") === "/news/bgmi", "calculator hub stays under /news");
  assert(newsCategoryListingPath("guides") === "/guides", "custom category uses /{slug}");
  assert(categoryListingOccupiesTopSlug("bgmi") === false, "bgmi listing does not steal /bgmi");
  assert(categoryListingOccupiesTopSlug("guides") === true, "custom category occupies /guides");
  assert(isReservedPublicSlug("contact") === true, "contact is a site URL");
  assert(isReservedPublicSlug("random-hub-xyz") === false, "unknown slug is free vs static");
  console.log("PASS  slug draft + listing path + reserved occupancy");
}

function staticWiring() {
  const admin = read("app/admin/news-categories/AdminNewsCategoriesClient.tsx");
  assert(admin.includes("formatCategorySlugDraft"), "admin slug onChange must keep trailing hyphen");
  assert(!admin.includes("normalizeCategorySlugInput(e.target.value)"), "live slug must not fully normalize");
  assert(admin.includes("This URL already exists"), "admin must show duplicate URL error");
  assert(admin.includes("/api/admin/news-categories"), "admin duplicate check endpoint");

  const catApi = read("app/api/admin/news-categories/route.ts");
  assert(catApi.includes("isCategoryPublicSlugTaken"), "category GET must check taken URLs");
  assert(catApi.includes("URL_TAKEN_SITE"), "category API must map site URL clash");
  assert(catApi.includes("URL_TAKEN_PAGE"), "category API must map page clash");

  const pageApi = read("app/api/admin/pages/route.ts");
  assert(pageApi.includes("isPagePublicSlugTaken"), "pages GET must check taken URLs");
  assert(pageApi.includes("URL_TAKEN_SITE"), "pages API must map site URL clash");
  assert(pageApi.includes("URL_TAKEN_CATEGORY"), "pages API must map category clash");

  const slugPage = read("app/[slug]/page.tsx");
  assert(slugPage.includes("newsCategoryListingPath"), "[slug] must compare canonical listing path");
  assert(slugPage.includes("permanentRedirect"), "shadowed category hubs must redirect");

  const dbSafe = read("src/server/dbSafe.ts");
  assert(dbSafe.includes("URL_TAKEN_SITE"), "tryPrismaLong must rethrow URL clashes");
  const conflicts = read("src/server/publicUrlConflicts.ts");
  assert(conflicts.includes("tryPrismaLong"), "admin slug taken-check must use tryPrismaLong");

  const files = [
    "src/lib/newsCategories.ts",
    "src/lib/reservedPublicSlugs.ts",
    "src/server/publicUrlConflicts.ts",
    "app/admin/news-categories/AdminNewsCategoriesClient.tsx",
    "app/api/admin/news-categories/route.ts",
    "app/[slug]/page.tsx",
  ];
  for (const rel of files) {
    const n = lineCount(rel);
    console.log(`  lines ${String(n).padStart(4)}  ${rel}`);
    assert(n <= 400, `${rel} is ${n} lines (max 400)`);
  }
  console.log("PASS  static wiring + line limits");
}

function reservedCoversAppRoutes() {
  const fromApp = collectStaticTopSlugs();
  const missing = [...fromApp].filter((slug) => !RESERVED_PUBLIC_SLUGS.has(slug)).sort();
  if (missing.length) {
    throw new Error(`Static app routes missing from RESERVED_PUBLIC_SLUGS: ${missing.join(", ")}`);
  }
  console.log(`PASS  reserved set covers ${fromApp.size} static public routes`);
}

async function dbSuite(prisma) {
  const collisions = [];
  const categories = await prisma.newsCategory.findMany({ select: { id: true, slug: true, label: true } });
  const pages = await prisma.pageTemplate.findMany({ select: { id: true, slug: true, title: true } });
  const news = await prisma.newsPost.findMany({ select: { id: true, slug: true, primaryCategory: true } });

  const catBySlug = new Map();
  for (const row of categories) {
    const slug = row.slug.trim().toLowerCase();
    if (catBySlug.has(slug)) {
      collisions.push(`duplicate news category slug: ${slug}`);
    }
    catBySlug.set(slug, row);
  }

  const pageByTop = new Map();
  for (const row of pages) {
    const top = row.slug.trim().replace(/^\/+|\/+$/g, "").toLowerCase().split("/")[0] ?? "";
    if (!top) continue;
    const list = pageByTop.get(top) ?? [];
    list.push(row);
    pageByTop.set(top, list);
    if (isReservedPublicSlug(top) && top !== "") {
      collisions.push(`page "${row.slug}" (${row.title}) clashes with website URL /${top}`);
    }
  }

  for (const [slug, row] of catBySlug) {
    if (!categoryListingOccupiesTopSlug(slug)) continue;
    if (isReservedPublicSlug(slug)) {
      collisions.push(`category "${slug}" (${row.label}) listing /${slug} clashes with website URL`);
    }
    const pageHits = pageByTop.get(slug) ?? [];
    for (const page of pageHits) {
      collisions.push(`category "${slug}" and page "${page.slug}" share /${slug}`);
    }
  }

  const newsSlugFreq = new Map();
  for (const row of news) {
    const slug = row.slug.trim().toLowerCase();
    newsSlugFreq.set(slug, (newsSlugFreq.get(slug) ?? 0) + 1);
  }
  for (const [slug, count] of newsSlugFreq) {
    if (count > 1) collisions.push(`duplicate news article slug: ${slug} x${count}`);
  }

  if (collisions.length) {
    console.log("EXISTING URL COLLISIONS:");
    for (const item of collisions) console.log(`  - ${item}`);
  } else {
    console.log("PASS  no existing category/page/site URL collisions in DB");
  }

  assert((await findCategoryPublicSlugConflict("contact")) === "URL_TAKEN_SITE", "category contact vs /contact");
  assert((await findCategoryPublicSlugConflict("bgmi")) === "SLUG_EXISTS", "existing bgmi category");
  assert((await findPagePublicSlugConflict("bgmi")) === "URL_TAKEN_SITE", "page cannot take /bgmi");
  assert((await findPagePublicSlugConflict("ff-max")) === "URL_TAKEN_CATEGORY", "page cannot take a category slug");
  assert((await findPagePublicSlugConflict("privacy")) === "URL_TAKEN_SITE", "page cannot take /privacy");

  const stamp = Date.now();
  const freeSlug = `e2e-url-uniq-${stamp}`;
  assert((await findCategoryPublicSlugConflict(freeSlug)) === null, "fresh category slug is free");
  assert((await findPagePublicSlugConflict(freeSlug)) === null, "fresh page slug is free");

  const page = await prisma.pageTemplate.create({
    data: {
      title: `E2E URL Uniq ${stamp}`,
      slug: freeSlug,
      status: "draft",
      content: { html: "<p>e2e</p>" },
    },
  });
  try {
    assert(
      (await findCategoryPublicSlugConflict(freeSlug)) === "URL_TAKEN_PAGE",
      "category cannot reuse an existing page URL",
    );
    assert((await findPagePublicSlugConflict(freeSlug, page.id)) === null, "same page can keep its slug");
  } finally {
    await prisma.pageTemplate.delete({ where: { id: page.id } });
  }

  const cat = await prisma.newsCategory.create({
    data: { slug: freeSlug, label: `E2E Uniq ${stamp}`, sortOrder: 9999 },
  });
  try {
    assert(
      (await findPagePublicSlugConflict(freeSlug)) === "URL_TAKEN_CATEGORY",
      "page cannot reuse an occupying category URL",
    );
    assert((await findCategoryPublicSlugConflict(freeSlug, cat.id)) === null, "same category can keep its slug");
  } finally {
    await prisma.newsCategory.delete({ where: { id: cat.id } });
  }

  console.log("PASS  DB conflict guards (site/page/category)");
  return collisions;
}

async function main() {
  loadEnv();
  console.log("=== e2e-public-url-uniqueness ===");
  helperSuite();
  staticWiring();
  reservedCoversAppRoutes();

  if (!process.env.DATABASE_URL) {
    console.log("SKIP  DB scan (no DATABASE_URL)");
    return;
  }
  const prisma = new PrismaClient();
  try {
    const collisions = await dbSuite(prisma);
    if (collisions.length) {
      throw new Error(`Found ${collisions.length} existing duplicate/clash URL(s). See list above.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("FAIL", error.message);
  process.exit(1);
});
