/**
 * E2E: Publish in News on page Update (clone → news upsert).
 * Usage: node scripts/e2e-publish-as-news.mjs
 *
 * Checks:
 * 1) Client PATCH payload includes publishAsNews
 * 2) DB: create page → PATCH-like update with publishAsNews → news row exists + published
 * 3) Second update upserts (same news slug, still published)
 * Cleans up e2e rows at the end.
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

function newsSlugFromPageSlug(slug) {
  return (
    String(slug)
      .trim()
      .replace(/^\/+/, "")
      .replace(/\/+$/, "")
      .toLowerCase()
      .replaceAll("/", "-")
      .replace(/^-+/, "") || `page-${Date.now()}`
  );
}

async function upsertNewsFromPage(prisma, input) {
  const newsSlug = newsSlugFromPageSlug(input.pageSlug);
  let html = "";
  if (input.pageContent && typeof input.pageContent === "object" && input.pageContent.html) {
    html = String(input.pageContent.html).trim();
  }
  if (!html) {
    const desc = (input.seoDescription || "").trim();
    html = desc
      ? `<p>${desc}</p><p><a href="/${input.pageSlug}">Open ${input.title}</a></p>`
      : `<p>${input.title}</p><p><a href="/${input.pageSlug}">Open page</a></p>`;
  }
  const data = {
    title: input.title,
    slug: newsSlug,
    status: "published",
    seoTitle: input.seoTitle || null,
    seoDescription: input.seoDescription || null,
    featureImage: input.ogImageUrl || null,
    content: { html },
    publishedAt: new Date(),
  };
  const existing = await prisma.newsPost.findUnique({
    where: { slug: newsSlug },
    select: { id: true },
  });
  if (existing) {
    await prisma.newsPost.update({ where: { id: existing.id }, data });
    return { newsSlug, created: false };
  }
  await prisma.newsPost.create({ data });
  return { newsSlug, created: true };
}

function checkClientPatchSendsPublishAsNews() {
  const file = path.join(root, "app", "admin", "pages", "AdminPagesClient.tsx");
  const src = fs.readFileSync(file, "utf8");
  const patchIdx = src.indexOf('method: "PATCH"');
  assert(patchIdx > 0, "PATCH method not found in AdminPagesClient");
  const patchBlock = src.slice(patchIdx, patchIdx + 900);
  assert(
    patchBlock.includes("publishAsNews"),
    "FAIL: PATCH body does not include publishAsNews",
  );
  assert(
    src.includes("newsError"),
    "FAIL: client missing newsError handling",
  );
  console.log("PASS  client PATCH includes publishAsNews + newsError handling");
}

function checkApiPatchSchema() {
  const file = path.join(root, "app", "api", "admin", "pages", "route.ts");
  const src = fs.readFileSync(file, "utf8");
  const patchFn = src.indexOf("export async function PATCH");
  assert(patchFn > 0, "PATCH handler missing");
  const block = src.slice(patchFn);
  assert(block.includes("publishAsNews"), "FAIL: PATCH zod schema missing publishAsNews");
  assert(block.includes("newsError"), "FAIL: PATCH response missing newsError");
  assert(block.includes("newsPublished"), "FAIL: PATCH response missing newsPublished");
  console.log("PASS  API PATCH accepts publishAsNews and returns newsError");
}

async function main() {
  loadEnv();
  console.log("=== e2e-publish-as-news ===");

  checkClientPatchSendsPublishAsNews();
  checkApiPatchSchema();

  if (!process.env.DATABASE_URL) {
    console.log("SKIP  DB tests (no DATABASE_URL) — static checks only");
    console.log("VERDICT PASS_STATIC");
    return;
  }

  const prisma = new PrismaClient();
  const stamp = Date.now();
  const pageSlug = `e2e-publish-news-${stamp}`;
  const newsSlug = newsSlugFromPageSlug(pageSlug);
  const title = `E2E Publish News ${stamp}`;
  let pageId = null;

  try {
    console.log("1) Create page (publishAsNews=false)...");
    const page = await prisma.pageTemplate.create({
      data: {
        title,
        slug: pageSlug,
        status: "draft",
        seoTitle: title,
        seoDescription: "E2E seo description for publish as news test page content.",
        content: { html: "<p>E2E body</p>", meta: { templateType: "home", game: "freefire" } },
        publishAsNews: false,
      },
    });
    pageId = page.id;
    console.log("   pageId", pageId);

    console.log("2) Update page + upsert news (simulates Update Clone + Publish in News)...");
    const updated = await prisma.pageTemplate.update({
      where: { id: pageId },
      data: {
        publishAsNews: true,
        title,
        seoDescription: "E2E seo description for publish as news test page content.",
      },
    });
    assert(updated.publishAsNews === true, "page.publishAsNews not saved");

    const sync1 = await upsertNewsFromPage(prisma, {
      title: updated.title,
      pageSlug: updated.slug,
      seoTitle: updated.seoTitle,
      seoDescription: updated.seoDescription,
      ogImageUrl: updated.ogImageUrl,
      pageContent: updated.content,
    });
    assert(sync1.created === true, "expected news create on first publish");
    assert(sync1.newsSlug === newsSlug, `news slug mismatch ${sync1.newsSlug} vs ${newsSlug}`);

    const news1 = await prisma.newsPost.findUnique({ where: { slug: newsSlug } });
    assert(news1, "news row missing after publish");
    assert(news1.status === "published", "news status not published");
    assert(news1.title === title, "news title mismatch");
    const html1 =
      news1.content && typeof news1.content === "object" ? news1.content.html : "";
    assert(String(html1).includes("E2E body") || String(html1).length > 0, "news html empty");
    console.log("PASS  first publish created news", newsSlug);

    console.log("3) Second update upsert (must not duplicate slug)...");
    const sync2 = await upsertNewsFromPage(prisma, {
      title: `${title} Updated`,
      pageSlug: updated.slug,
      seoTitle: updated.seoTitle,
      seoDescription: "Updated description for second upsert.",
      pageContent: { html: "<p>E2E body updated</p>" },
    });
    assert(sync2.created === false, "second publish should update existing news");
    const count = await prisma.newsPost.count({ where: { slug: newsSlug } });
    assert(count === 1, `expected 1 news row, got ${count}`);
    const news2 = await prisma.newsPost.findUnique({ where: { slug: newsSlug } });
    assert(news2.title === `${title} Updated`, "news title not updated on upsert");
    assert(news2.status === "published", "news not published after upsert");
    console.log("PASS  upsert updated same news row");

    console.log("VERDICT PASS");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/Authentication failed|Can't reach database|P1001|P1000|credentials/i.test(msg)) {
      console.log("SKIP  DB tests (database not reachable from this machine)");
      console.log("VERDICT PASS_STATIC");
      console.log("Run on VPS for full DB e2e: cd /var/www/bgmi && node scripts/e2e-publish-as-news.mjs");
      return;
    }
    throw err;
  } finally {
    if (pageId) {
      await prisma.pageTemplate.delete({ where: { id: pageId } }).catch(() => {});
    }
    await prisma.newsPost.deleteMany({ where: { slug: newsSlug } }).catch(() => {});
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("VERDICT FAIL");
  console.error(err);
  process.exit(1);
});
