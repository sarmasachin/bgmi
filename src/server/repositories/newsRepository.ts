import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { mockStore } from "@/src/server/mockStore";
import { prisma, tryPrisma } from "@/src/server/dbSafe";
import { sanitizeHtml } from "@/src/lib/sanitizeHtml";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { extractNewsHtml, extractNewsMeta, type NewsMeta } from "@/src/lib/newsContent";

export type { NewsMeta };
export { extractNewsHtml, extractNewsMeta };

export type NewsInput = {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featureImage?: string;
  status: string;
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

export function resolveNewsCanonicalUrl(slug: string, canonicalUrl?: string | null) {
  const trimmed = canonicalUrl?.trim();
  if (trimmed) return toCanonicalUrl(trimmed);
  const safeSlug = slug.trim().replace(/^\/+|\/+$/g, "");
  return toCanonicalUrl(safeSlug ? `/news/${safeSlug}` : "/news");
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
    canonicalUrl: resolveNewsCanonicalUrl(input.slug, input.canonicalUrl),
    keywords: input.metaKeywords ?? "",
  };
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

/** All published news for sitemap.xml (slug + dates only). */
export async function listPublishedNewsForSitemap() {
  const dbResult = await tryPrisma(async () =>
    prisma.newsPost.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true, publishedAt: true },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    }),
  );
  if (dbResult) return dbResult;

  return mockStore.news
    .filter((item) => item.status === "published" && item.slug)
    .map((item) => ({
      slug: item.slug,
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
    }));
}

export async function getNewsById(id: string) {
  const dbResult = await tryPrisma(async () => prisma.newsPost.findUnique({ where: { id } }));
  if (dbResult) return dbResult;
  return mockStore.news.find((item) => item.id === id) ?? null;
}

export const getPublishedNewsBySlug = cache(async function getPublishedNewsBySlug(slug: string) {
  const dbResult = await tryPrisma(async () =>
    prisma.newsPost.findFirst({
      where: { slug, status: "published" },
    }),
  );
  if (dbResult) return dbResult;
  return mockStore.news.find((item) => item.slug === slug && item.status === "published") ?? null;
});

export async function createNews(input: NewsInput) {
  const content = buildNewsContent({
    html: input.content ?? "",
    metaPatch: newsMetaPatchFromInput(input),
  });

  const dbResult = await tryPrisma(async () =>
    prisma.newsPost.create({
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        featureImage: input.featureImage,
        status: input.status,
        seoTitle: input.seoTitle?.trim() || null,
        seoDescription: input.seoDescription?.trim() || null,
        content,
      },
    }),
  );
  if (dbResult) return dbResult;

  const item = {
    id: `n${Date.now()}`,
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt ?? "",
    featureImage: input.featureImage ?? "",
    status: input.status,
    seoTitle: input.seoTitle?.trim() || "",
    seoDescription: input.seoDescription?.trim() || "",
    content,
  };
  mockStore.news.unshift(item);
  return item;
}

export async function updateNewsStatus(id: string, status: string) {
  const dbResult = await tryPrisma(async () => {
    const existing = await prisma.newsPost.findUnique({ where: { id } });
    if (!existing) return null;

    const nextPublishedAt =
      status === "published"
        ? (existing.publishedAt ?? new Date())
        : null;

    return prisma.newsPost.update({
      where: { id },
      data: { status, publishedAt: nextPublishedAt },
    });
  });
  if (dbResult) return dbResult;

  const item = mockStore.news.find((news) => news.id === id);
  if (!item) return null;
  if (status === "published" && !(item as { publishedAt?: string }).publishedAt) {
    (item as { publishedAt?: string }).publishedAt = new Date().toISOString();
  }
  if (status !== "published") {
    delete (item as { publishedAt?: string }).publishedAt;
  }
  item.status = status;
  return item;
}

export async function updateNews(
  input: Omit<NewsInput, "status"> & { id: string; status?: "draft" | "published" },
) {
  const dbResult = await tryPrisma(async () => {
    const existing = await prisma.newsPost.findUnique({ where: { id: input.id } });
    if (!existing) return null;

    let nextPublishedAt: Date | null | undefined = undefined;
    if (input.status === "published") {
      nextPublishedAt = existing.publishedAt ?? new Date();
    } else if (input.status === "draft") {
      nextPublishedAt = null;
    }

    return prisma.newsPost.update({
      where: { id: input.id },
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        featureImage: input.featureImage,
        seoTitle: input.seoTitle?.trim() || null,
        seoDescription: input.seoDescription?.trim() || null,
        content: buildNewsContent({
          html: input.content ?? "",
          existing: existing.content,
          metaPatch: newsMetaPatchFromInput(input),
        }),
        status: input.status ?? undefined,
        publishedAt: nextPublishedAt,
      },
    });
  });
  if (dbResult) return dbResult;

  const item = mockStore.news.find((news) => news.id === input.id);
  if (!item) return null;
  item.title = input.title;
  item.slug = input.slug;
  item.excerpt = input.excerpt ?? "";
  item.featureImage = input.featureImage ?? "";
  (item as { seoTitle?: string }).seoTitle = input.seoTitle?.trim() || "";
  (item as { seoDescription?: string }).seoDescription = input.seoDescription?.trim() || "";
  (item as { content?: unknown }).content = buildNewsContent({
    html: input.content ?? "",
    existing: (item as { content?: unknown }).content,
    metaPatch: newsMetaPatchFromInput(input),
  });
  if (input.status) {
    item.status = input.status;
  }
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
