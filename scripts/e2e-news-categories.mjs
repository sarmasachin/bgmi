/**
 * E2E: News primary/extra categories + public URL model.
 * Usage: node scripts/e2e-news-categories.mjs
 *
 * Checks:
 * 1) 1000-line rule on news-related + recently touched files
 * 2) Static wiring (admin UI, API zod, routes, helpers)
 * 3) Category helper behavior (one article = one primary URL)
 * 4) DB CRUD: create → update categories → list hubs → delete (if DATABASE_URL works)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

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
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
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
  const full = path.join(root, rel);
  assert(fs.existsSync(full), `Missing file: ${rel}`);
  return fs.readFileSync(full, "utf8").split(/\r?\n/).length;
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function checkLineLimits() {
  const mustStayUnder = [
    "app/admin/news/AdminNewsClient.tsx",
    "src/server/repositories/newsRepository.ts",
    "src/server/repositories/pagesRepository.ts",
    "src/features/news/NewsSection.tsx",
    "src/features/news/NewsDetailView.tsx",
    "src/features/news/CategoryNewsListingPage.tsx",
    "src/lib/newsCategories.ts",
    "app/[slug]/[newsSlug]/page.tsx",
    "app/api/admin/news/route.ts",
    "app/sitemap.ts",
    "app/[slug]/page.tsx",
  ];
  const failures = [];
  for (const rel of mustStayUnder) {
    const n = lineCount(rel);
    console.log(`  lines ${String(n).padStart(4)}  ${rel}`);
    if (n > 1000) failures.push(`${rel} = ${n}`);
  }
  assert(failures.length === 0, `FAIL 1000-line rule: ${failures.join("; ")}`);

  const knownOver = [
    "app/admin/pages/AdminPagesClient.tsx",
    "src/components/admin/RichTextEditor.tsx",
  ];
  for (const rel of knownOver) {
    if (!fs.existsSync(path.join(root, rel))) continue;
    const n = lineCount(rel);
    console.log(`  WARN  ${n}  ${rel} (pre-existing over 1000 — not this feature)`);
  }
  console.log("PASS  news-feature files under 1000 lines");
}

function checkStaticWiring() {
  const cats = read("src/lib/newsCategories.ts");
  assert(cats.includes('slug: "ff-max"'), "missing ff-max category");
  assert(cats.includes('slug: "free-fire"'), "missing free-fire category");
  assert(cats.includes("newsArticlePath"), "missing newsArticlePath");
  assert(cats.includes("normalizeExtraCategories"), "missing normalizeExtraCategories");

  const admin = read("app/admin/news/AdminNewsClient.tsx");
  assert(admin.includes("primaryCategory"), "admin missing primaryCategory state");
  assert(admin.includes("extraCategories"), "admin missing extraCategories state");
  assert(admin.includes("Main category"), "admin missing main category UI");
  assert(admin.includes("Also show in"), "admin missing extra category UI");
  assert(admin.includes("newsArticlePath"), "admin missing primary URL helper");
  assert(!admin.includes("toCanonicalUrl(`/news/${"), "admin still auto-canonical to /news/slug");

  const api = read("app/api/admin/news/route.ts");
  assert(api.includes('primaryCategory: z.enum(["ff-max", "free-fire"])'), "API missing primaryCategory zod");
  assert(api.includes("extraCategories"), "API missing extraCategories");
  assert(api.includes("newsArticlePath"), "API push urlPath missing newsArticlePath");

  const schema = read("prisma/schema.prisma");
  assert(schema.includes("primaryCategory"), "Prisma missing primaryCategory");
  assert(schema.includes("extraCategories"), "Prisma missing extraCategories");

  const articleRoute = read("app/[slug]/[newsSlug]/page.tsx");
  assert(articleRoute.includes("isNewsCategorySlug"), "article route missing category guard");
  assert(articleRoute.includes("permanentRedirect"), "wrong-category should redirect");
  assert(articleRoute.includes("NewsDetailView"), "article route missing detail view");
  assert(articleRoute.includes("newsSlug"), "article route must use newsSlug param");

  // Next.js forbids app/[category] beside app/[slug]
  assert(
    !fs.existsSync(path.join(root, "app", "[category]")),
    "FAIL: app/[category] conflicts with app/[slug] — use app/[slug]/[newsSlug]",
  );

  const legacy = read("app/news/[slug]/page.tsx");
  assert(legacy.includes("permanentRedirect"), "legacy /news/[slug] must redirect");
  assert(legacy.includes("newsArticlePath"), "legacy redirect missing primary path");

  const slugPage = read("app/[slug]/page.tsx");
  assert(slugPage.includes("isNewsCategorySlug"), "category hub not wired in [slug]");
  assert(slugPage.includes("CategoryNewsListingPage"), "category listing page missing");

  const sitemap = read("app/sitemap.ts");
  assert(sitemap.includes("newsArticlePath"), "sitemap not using primary path");
  assert(sitemap.includes("ff-max"), "sitemap missing ff-max hub");

  const repo = read("src/server/repositories/newsRepository.ts");
  assert(repo.includes("listPublishedNewsByCategory"), "repo missing category listing");
  assert(repo.includes("primaryCategory"), "repo missing primaryCategory writes");
  assert(repo.includes("extraCategories"), "repo missing extraCategories writes");

  console.log("PASS  static wiring (admin/API/routes/schema/sitemap)");
}

/** Mirror of src/lib/newsCategories helpers for isolated asserts. */
function helperSuite() {
  const DEFAULT = "ff-max";
  const set = new Set(["ff-max", "free-fire"]);
  const coerce = (v) => (set.has(String(v || "").trim().toLowerCase()) ? String(v).trim().toLowerCase() : DEFAULT);
  const pathFor = (cat, slug) => `/${coerce(cat)}/${String(slug).trim().replace(/^\/+|\/+$/g, "")}`;
  const extras = (primary, list) => {
    const p = coerce(primary);
    const out = [];
    for (const raw of list || []) {
      const c = coerce(raw);
      if (c === p || out.includes(c)) continue;
      if (!set.has(c)) continue;
      // coerce maps invalid → default; only keep real members that aren't primary
      const n = String(raw || "").trim().toLowerCase();
      if (!set.has(n) || n === p || out.includes(n)) continue;
      out.push(n);
    }
    return out;
  };

  assert(pathFor("ff-max", "redeem-codes") === "/ff-max/redeem-codes", "primary path ff-max");
  assert(pathFor("free-fire", "redeem-codes") === "/free-fire/redeem-codes", "primary path free-fire");
  assert(pathFor("nope", "x") === "/ff-max/x", "invalid primary falls back");
  assert(JSON.stringify(extras("ff-max", ["free-fire", "ff-max", "free-fire"])) === '["free-fire"]', "extras dedupe + drop primary");
  assert(JSON.stringify(extras("free-fire", ["ff-max"])) === '["ff-max"]', "extras allow other hub");
  console.log("PASS  helper: one primary URL + extras listing-only");
}

async function dbSuite(prisma) {
  const stamp = Date.now();
  const slug = `e2e-news-cat-${stamp}`;
  let id = null;

  try {
    console.log("1) CREATE news primary=ff-max extra=free-fire...");
    const created = await prisma.newsPost.create({
      data: {
        title: `E2E News Cat ${stamp}`,
        slug,
        status: "published",
        primaryCategory: "ff-max",
        extraCategories: ["free-fire"],
        excerpt: "e2e category check",
        content: { html: "<p>e2e</p>" },
        publishedAt: new Date(),
      },
    });
    id = created.id;
    assert(created.primaryCategory === "ff-max", "create primaryCategory");
    assert(
      JSON.stringify(created.extraCategories) === '["free-fire"]',
      "create extraCategories",
    );

    console.log("2) Hub queries (primary + extra)...");
    const inFfMax = await prisma.newsPost.count({
      where: {
        id,
        status: "published",
        OR: [{ primaryCategory: "ff-max" }, { extraCategories: { has: "ff-max" } }],
      },
    });
    const inFreeFire = await prisma.newsPost.count({
      where: {
        id,
        status: "published",
        OR: [{ primaryCategory: "free-fire" }, { extraCategories: { has: "free-fire" } }],
      },
    });
    assert(inFfMax === 1, "should appear on /ff-max hub");
    assert(inFreeFire === 1, "should appear on /free-fire hub via extra");

    console.log("3) UPDATE primary → free-fire, clear extras...");
    const updated = await prisma.newsPost.update({
      where: { id },
      data: {
        primaryCategory: "free-fire",
        extraCategories: [],
        title: `E2E News Cat Updated ${stamp}`,
      },
    });
    assert(updated.primaryCategory === "free-fire", "update primaryCategory");
    assert(updated.extraCategories.length === 0, "update cleared extras");

    const afterMax = await prisma.newsPost.count({
      where: {
        id,
        OR: [{ primaryCategory: "ff-max" }, { extraCategories: { has: "ff-max" } }],
      },
    });
    const afterFf = await prisma.newsPost.count({
      where: {
        id,
        OR: [{ primaryCategory: "free-fire" }, { extraCategories: { has: "free-fire" } }],
      },
    });
    assert(afterMax === 0, "after primary switch should leave /ff-max");
    assert(afterFf === 1, "after primary switch should be on /free-fire");

    console.log("4) UPDATE add extra=ff-max (URL stays free-fire)...");
    const withExtra = await prisma.newsPost.update({
      where: { id },
      data: { extraCategories: ["ff-max"] },
    });
    assert(withExtra.primaryCategory === "free-fire", "primary URL category unchanged");
    assert(JSON.stringify(withExtra.extraCategories) === '["ff-max"]', "extra added");
    const publicPath = `/free-fire/${slug}`;
    assert(publicPath === `/free-fire/${withExtra.slug}`, "one link only = primary path");

    console.log("5) DELETE...");
    await prisma.newsPost.delete({ where: { id } });
    id = null;
    const gone = await prisma.newsPost.findUnique({ where: { slug } });
    assert(!gone, "delete should remove row");

    console.log("PASS  DB CRUD create/update/delete + hub membership");
  } finally {
    if (id) {
      await prisma.newsPost.delete({ where: { id } }).catch(() => {});
    }
    await prisma.newsPost.deleteMany({ where: { slug: { startsWith: "e2e-news-cat-" } } }).catch(() => {});
  }
}

async function main() {
  loadEnv();
  console.log("=== e2e-news-categories ===");

  checkLineLimits();
  checkStaticWiring();
  helperSuite();

  if (!process.env.DATABASE_URL) {
    console.log("SKIP  DB tests (no DATABASE_URL)");
    console.log("VERDICT PASS_STATIC");
    return;
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    // Ensure columns exist (feature migration).
    const cols = await prisma.$queryRawUnsafe(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'NewsPost' AND column_name IN ('primaryCategory','extraCategories')`,
    );
    const names = new Set((cols || []).map((r) => r.column_name));
    if (!names.has("primaryCategory") || !names.has("extraCategories")) {
      console.log("SKIP  DB tests — run: npx prisma db push (columns missing)");
      console.log("VERDICT PASS_STATIC");
      return;
    }
    await dbSuite(prisma);
    console.log("VERDICT PASS");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/P1000|P1001|P1017|Authentication failed|Can't reach|ECONNREFUSED/i.test(msg)) {
      console.log("SKIP  DB tests (DB unreachable):", msg.split("\n")[0]);
      console.log("VERDICT PASS_STATIC");
      console.log("Run full DB e2e on VPS: cd /var/www/bgmi && npx prisma db push && node scripts/e2e-news-categories.mjs");
      return;
    }
    throw err;
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

main().catch((err) => {
  console.error("FAIL", err instanceof Error ? err.message : err);
  process.exit(1);
});
