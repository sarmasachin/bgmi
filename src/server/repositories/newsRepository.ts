import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { mockStore } from "@/src/server/mockStore";
import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";
import { sanitizeHtml } from "@/src/lib/sanitizeHtml";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { extractNewsHtml, extractNewsMeta, type NewsMeta } from "@/src/lib/newsContent";
import {
  coerceNewsCategory,
  newsArticlePath,
  normalizeExtraCategories,
  type NewsCategorySlug,
} from "@/src/lib/newsCategories";
import { bumpSitemapLastmod } from "@/src/server/repositories/sitemapLastmodRepository";

export type { NewsMeta };
export { extractNewsHtml, extractNewsMeta };

export type NewsInput = {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featureImage?: string;
  status: string;
  primaryCategory?: string;
  extraCategories?: string[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  socialTitle?: string;
  socialDescription?: string;
  socialImageAlt?: string;
  metaKeywords?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readPrimaryCategory(item: { primaryCategory?: string | null }) {
  return coerceNewsCategory(item.primaryCategory);
}

function readExtraCategories(
  primary: NewsCategorySlug,
  item: { extraCategories?: string[] | null },
) {
  return normalizeExtraCategories(primary, item.extraCategories);
}

function isOwnPublicHost(hostname: string) {
  const host = hostname.replace(/^www\./i, "").toLowerCase();
  return (
    host === "sensitivitysettings.com" ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === ""
  );
}

export function resolveNewsCanonicalUrl(
  slug: string,
  canonicalUrl?: string | null,
  primaryCategory?: string | null,
) {
  const safeSlug = slug.trim().replace(/^\/+|\/+$/g, "").toLowerCase();
  if (!safeSlug) return toCanonicalUrl("/news");
  const primaryPath = newsArticlePath(primaryCategory, safeSlug);
  const trimmed = canonicalUrl?.trim();
  if (trimmed) {
    try {
      const parsed = new URL(trimmed, "https://sensitivitysettings.com");
      const path = (parsed.pathname.replace(/\/+$/, "") || "/").toLowerCase();
      const last = path.split("/").filter(Boolean).pop() ?? "";
      const legacyPath = `/news/${safeSlug}`;
      // Drop auto-saved mixed-case / legacy /news/slug canonicals — one lowercase URL only.
      if (isOwnPublicHost(parsed.hostname) && (path === legacyPath || last === safeSlug)) {
        return toCanonicalUrl(primaryPath);
      }
      return toCanonicalUrl(trimmed);
    } catch {
      return toCanonicalUrl(primaryPath);
    }
  }
  return toCanonicalUrl(primaryPath);
}

function normalizeNewsSlug(slug: string) {
  return slug.trim().replace(/^\/+|\/+$/g, "").replace(/\s+/g, "-").toLowerCase();
}

function normalizeComparableTitle(title: string) {
  return title.trim().replace(/\s+/g, " ").toLowerCase();
}

function resolveCategoriesFromInput(input: {
  primaryCategory?: string;
  extraCategories?: string[];
}) {
  const primaryCategory = coerceNewsCategory(input.primaryCategory);
  const extraCategories = normalizeExtraCategories(primaryCategory, input.extraCategories);
  return { primaryCategory, extraCategories };
}

export async function newsSlugExists(slug: string, excludeId?: string) {
  const normalized = normalizeNewsSlug(slug);
  if (!normalized) return false;

  const dbData = await tryPrisma(async () => {
    const found = await prisma.newsPost.findFirst({
      where: excludeId
        ? { slug: { equals: normalized, mode: "insensitive" }, id: { not: excludeId } }
        : { slug: { equals: normalized, mode: "insensitive" } },
      select: { id: true },
    });
    return Boolean(found);
  });

  if (dbData !== null) return dbData;
  return mockStore.news.some(
    (item) => normalizeNewsSlug(item.slug) === normalized && item.id !== excludeId,
  );
}

export async function newsTitleExists(title: string, excludeId?: string) {
  const normalized = normalizeComparableTitle(title);
  if (!normalized) return false;

  const dbData = await tryPrisma(async () => {
    const rows = await prisma.newsPost.findMany({
      where: excludeId ? { id: { not: excludeId } } : undefined,
      select: { id: true, title: true },
    });
    return rows.some((row) => normalizeComparableTitle(row.title) === normalized);
  });

  if (dbData !== null) return dbData;
  return mockStore.news.some(
    (item) =>
      normalizeComparableTitle(item.title) === normalized && item.id !== excludeId,
  );
}

function buildNewsContent(input: {
  html?: string;
  existing?: unknown;
  metaPatch?: NewsMeta;
}) {
  const base: Record<string, unknown> = isRecord(input.existing)
    ? { ...(input.existing as Record<string, unknown>) }
    : {};
  const currentMeta = extractNewsMeta(input.existing);
  const nextMeta: NewsMeta = {
    socialTitle: input.metaPatch?.socialTitle ?? currentMeta.socialTitle,
    socialDescription: input.metaPatch?.socialDescription ?? currentMeta.socialDescription,
    socialImageAlt: input.metaPatch?.socialImageAlt ?? currentMeta.socialImageAlt,
    ogImageUrl: input.metaPatch?.ogImageUrl ?? currentMeta.ogImageUrl,
    canonicalUrl: input.metaPatch?.canonicalUrl ?? currentMeta.canonicalUrl,
    keywords:
      input.metaPatch && Object.prototype.hasOwnProperty.call(input.metaPatch, "keywords")
        ? input.metaPatch.keywords
        : currentMeta.keywords,
  };

  if (input.html !== undefined) {
    base.html = sanitizeHtml(input.html);
  } else if (!("html" in base) && typeof input.existing === "string") {
    base.html = sanitizeHtml(input.existing);
  }

  if (
    nextMeta.socialTitle?.trim() ||
    nextMeta.socialDescription?.trim() ||
    nextMeta.socialImageAlt?.trim() ||
    nextMeta.ogImageUrl?.trim() ||
    nextMeta.canonicalUrl?.trim() ||
    nextMeta.keywords?.trim()
  ) {
    const metaJson: Record<string, unknown> = {};
    if (nextMeta.socialTitle?.trim()) metaJson.socialTitle = nextMeta.socialTitle.trim();
    if (nextMeta.socialDescription?.trim()) metaJson.socialDescription = nextMeta.socialDescription.trim();
    if (nextMeta.socialImageAlt?.trim()) metaJson.socialImageAlt = nextMeta.socialImageAlt.trim();
    if (nextMeta.ogImageUrl?.trim()) metaJson.ogImageUrl = nextMeta.ogImageUrl.trim();
    if (nextMeta.canonicalUrl?.trim()) metaJson.canonicalUrl = nextMeta.canonicalUrl.trim();
    if (nextMeta.keywords?.trim()) metaJson.keywords = nextMeta.keywords.trim();
    base.meta = metaJson;
  } else {
    delete base.meta;
  }

  return base as Prisma.InputJsonValue;
}

function newsMetaPatchFromInput(input: {
  slug: string;
  primaryCategory?: string;
  socialTitle?: string;
  socialDescription?: string;
  socialImageAlt?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  metaKeywords?: string;
}): NewsMeta {
  return {
    socialTitle: input.socialTitle,
    socialDescription: input.socialDescription,
    socialImageAlt: input.socialImageAlt,
    ogImageUrl: input.ogImageUrl,
    canonicalUrl: resolveNewsCanonicalUrl(
      input.slug,
      input.canonicalUrl,
      input.primaryCategory,
    ),
    keywords: input.metaKeywords ?? "",
  };
}

function articleBelongsToCategory(
  item: { primaryCategory?: string | null; extraCategories?: string[] | null },
  category: NewsCategorySlug,
) {
  const primary = readPrimaryCategory(item);
  if (primary === category) return true;
  return readExtraCategories(primary, item).includes(category);
}

export async function listNews(page: number, pageSize: number) {
  const dbResult = await tryPrisma(async () => {
    const [data, total] = await Promise.all([
      prisma.newsPost.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.newsPost.count(),
    ]);
    return { data, total };
  });

  if (dbResult) return dbResult;
  const start = (page - 1) * pageSize;
  return {
    data: mockStore.news.slice(start, start + pageSize),
    total: mockStore.news.length,
  };
}

export async function listPublishedNews(page: number, pageSize: number) {
  const dbResult = await tryPrisma(async () => {
    const [data, total] = await Promise.all([
      prisma.newsPost.findMany({
        where: { status: "published" },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.newsPost.count({
        where: { status: "published" },
      }),
    ]);
    return { data, total };
  });

  if (dbResult) return dbResult;
  const onlyPublished = mockStore.news.filter((item) => item.status === "published");
  const start = (page - 1) * pageSize;
  return {
    data: onlyPublished.slice(start, start + pageSize),
    total: onlyPublished.length,
  };
}

export async function listPublishedNewsByCategory(
  category: NewsCategorySlug,
  page: number,
  pageSize: number,
) {
  const dbResult = await tryPrisma(async () => {
    const where: Prisma.NewsPostWhereInput = {
      status: "published",
      OR: [{ primaryCategory: category }, { extraCategories: { has: category } }],
    };
    const [data, total] = await Promise.all([
      prisma.newsPost.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.newsPost.count({ where }),
    ]);
    return { data, total };
  });

  if (dbResult) return dbResult;
  const onlyPublished = mockStore.news.filter(
    (item) => item.status === "published" && articleBelongsToCategory(item, category),
  );
  const start = (page - 1) * pageSize;
  return {
    data: onlyPublished.slice(start, start + pageSize),
    total: onlyPublished.length,
  };
}

/** All published news for sitemap.xml (slug + primary category + dates). */
export async function listPublishedNewsForSitemap() {
  const dbResult = await tryPrismaLong(async () =>
    prisma.newsPost.findMany({
      where: { status: "published" },
      select: {
        slug: true,
        primaryCategory: true,
        extraCategories: true,
        updatedAt: true,
        featureImage: true,
      },
      orderBy: [{ updatedAt: "desc" }],
    }),
  );
  if (dbResult) return dbResult;

  return mockStore.news
    .filter((item) => item.status === "published" && item.slug)
    .map((item) => ({
      slug: item.slug,
      primaryCategory: readPrimaryCategory(item),
      extraCategories: Array.isArray(item.extraCategories) ? item.extraCategories : [],
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
      featureImage: item.featureImage ?? null,
    }));
}

export async function getNewsById(id: string) {
  const dbResult = await tryPrisma(async () => prisma.newsPost.findUnique({ where: { id } }));
  if (dbResult) return dbResult;
  return mockStore.news.find((item) => item.id === id) ?? null;
}

export const getPublishedNewsBySlug = cache(async function getPublishedNewsBySlug(slug: string) {
  const normalized = normalizeNewsSlug(slug);
  const dbResult = await tryPrismaLong(async () =>
    prisma.newsPost.findFirst({
      where: { slug: { equals: normalized, mode: "insensitive" }, status: "published" },
    }),
  );
  if (dbResult) return dbResult;
  return (
    mockStore.news.find(
      (item) => normalizeNewsSlug(item.slug) === normalized && item.status === "published",
    ) ?? null
  );
});

export async function createNews(input: NewsInput) {
  const slug = normalizeNewsSlug(input.slug);
  if (!slug) throw new Error("INVALID_SLUG");
  if (await newsSlugExists(slug)) throw new Error("SLUG_EXISTS");
  if (await newsTitleExists(input.title)) throw new Error("TITLE_EXISTS");

  const { primaryCategory, extraCategories } = resolveCategoriesFromInput(input);
  const content = buildNewsContent({
    html: input.content ?? "",
    metaPatch: newsMetaPatchFromInput({ ...input, primaryCategory }),
  });

  const dbResult = await tryPrismaLong(async () =>
    prisma.newsPost.create({
      data: {
        title: input.title,
        slug,
        excerpt: input.excerpt,
        featureImage: input.featureImage,
        status: input.status,
        primaryCategory,
        extraCategories,
        seoTitle: input.seoTitle?.trim() || null,
        seoDescription: input.seoDescription?.trim() || null,
        content,
      },
    }),
  );
  if (dbResult) {
    bumpSitemapLastmod(["/news", `/${primaryCategory}`]);
    return dbResult;
  }

  const item = {
    id: `n${Date.now()}`,
    title: input.title,
    slug,
    excerpt: input.excerpt ?? "",
    featureImage: input.featureImage ?? "",
    status: input.status,
    primaryCategory,
    extraCategories,
    seoTitle: input.seoTitle?.trim() || "",
    seoDescription: input.seoDescription?.trim() || "",
    content,
  };
  mockStore.news.unshift(item);
  bumpSitemapLastmod(["/news", `/${primaryCategory}`]);
  return item;
}

export async function updateNewsStatus(id: string, status: string) {
  const dbResult = await tryPrismaLong(async () => {
    const existing = await prisma.newsPost.findUnique({ where: { id } });
    if (!existing) return null;

    const nextPublishedAt = status === "published" ? new Date() : null;

    return prisma.newsPost.update({
      where: { id },
      data: { status, publishedAt: nextPublishedAt },
    });
  });
  if (dbResult) {
    bumpSitemapLastmod(["/news", `/${readPrimaryCategory(dbResult)}`]);
    return dbResult;
  }

  const item = mockStore.news.find((news) => news.id === id);
  if (!item) return null;
  if (status === "published") {
    (item as { publishedAt?: string }).publishedAt = new Date().toISOString();
  }
  if (status !== "published") {
    delete (item as { publishedAt?: string }).publishedAt;
  }
  item.status = status;
  bumpSitemapLastmod(["/news", `/${readPrimaryCategory(item)}`]);
  return item;
}

export async function updateNews(
  input: Omit<NewsInput, "status"> & { id: string; status?: "draft" | "published" },
) {
  const slug = normalizeNewsSlug(input.slug);
  if (!slug) throw new Error("INVALID_SLUG");
  if (await newsSlugExists(slug, input.id)) throw new Error("SLUG_EXISTS");
  if (await newsTitleExists(input.title, input.id)) throw new Error("TITLE_EXISTS");

  const { primaryCategory, extraCategories } = resolveCategoriesFromInput(input);

  const dbResult = await tryPrismaLong(async () => {
    const existing = await prisma.newsPost.findUnique({ where: { id: input.id } });
    if (!existing) return null;

    let nextPublishedAt: Date | null | undefined = undefined;
    if (input.status === "published" || (!input.status && existing.status === "published")) {
      nextPublishedAt = new Date();
    } else if (input.status === "draft") {
      nextPublishedAt = null;
    }

    return prisma.newsPost.update({
      where: { id: input.id },
      data: {
        title: input.title,
        slug,
        excerpt: input.excerpt,
        featureImage: input.featureImage,
        primaryCategory,
        extraCategories,
        seoTitle: input.seoTitle?.trim() || null,
        seoDescription: input.seoDescription?.trim() || null,
        content: buildNewsContent({
          html: input.content ?? "",
          existing: existing.content,
          metaPatch: newsMetaPatchFromInput({ ...input, primaryCategory }),
        }),
        status: input.status ?? undefined,
        publishedAt: nextPublishedAt,
      },
    });
  });
  if (dbResult) {
    bumpSitemapLastmod(["/news", `/${primaryCategory}`]);
    return dbResult;
  }

  const item = mockStore.news.find((news) => news.id === input.id);
  if (!item) return null;
  item.title = input.title;
  item.slug = slug;
  item.excerpt = input.excerpt ?? "";
  item.featureImage = input.featureImage ?? "";
  item.primaryCategory = primaryCategory;
  item.extraCategories = extraCategories;
  (item as { seoTitle?: string }).seoTitle = input.seoTitle?.trim() || "";
  (item as { seoDescription?: string }).seoDescription = input.seoDescription?.trim() || "";
  (item as { content?: unknown }).content = buildNewsContent({
    html: input.content ?? "",
    existing: (item as { content?: unknown }).content,
    metaPatch: newsMetaPatchFromInput({ ...input, primaryCategory }),
  });
  if (input.status) {
    item.status = input.status;
  }
  if (input.status === "published" || (!input.status && item.status === "published")) {
    (item as { publishedAt?: string }).publishedAt = new Date().toISOString();
  }
  if (input.status === "draft") {
    delete (item as { publishedAt?: string }).publishedAt;
  }
  bumpSitemapLastmod(["/news", `/${primaryCategory}`]);
  return item;
}

export async function deleteNews(id: string) {
  const dbResult = await tryPrisma(async () => {
    await prisma.newsPost.delete({ where: { id } });
    return true;
  });
  if (dbResult) return true;

  const index = mockStore.news.findIndex((item) => item.id === id);
  if (index === -1) return false;
  mockStore.news.splice(index, 1);
  return true;
}
