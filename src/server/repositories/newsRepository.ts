import { cache } from "react";
import { mockStore } from "@/src/server/mockStore";
import { prisma, tryPrisma } from "@/src/server/dbSafe";

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

export async function createNews(input: {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featureImage?: string;
  status: string;
}) {
  const dbResult = await tryPrisma(async () =>
    prisma.newsPost.create({
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        featureImage: input.featureImage,
        status: input.status,
        content: { html: input.content ?? "" },
      },
    }),
  );
  if (dbResult) return dbResult;

  const item = { id: `n${Date.now()}`, ...input };
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

export async function updateNews(input: {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  featureImage?: string;
  status?: "draft" | "published";
}) {
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
        content: { html: input.content ?? "" },
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
  item.content = input.content ?? "";
  item.featureImage = input.featureImage ?? "";
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
