import { cache } from "react";
import { mockStore } from "@/src/server/mockStore";
import { prisma, tryPrisma } from "@/src/server/dbSafe";
import type { Prisma } from "@prisma/client";

type TemplateType = "home" | "article" | "landing";

type PageInput = {
  title: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  templateType?: TemplateType;
  socialTitle?: string;
  socialDescription?: string;
  socialImageAlt?: string;
  content?: string;
  status: "draft" | "published";
  publishAsNews?: boolean;
};

type PageMeta = {
  templateType?: TemplateType;
  socialTitle?: string;
  socialDescription?: string;
  socialImageAlt?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractHtml(content: unknown) {
  if (typeof content === "string") return content;
  if (isRecord(content) && typeof content.html === "string") return content.html;
  return "";
}

function extractMeta(content: unknown): PageMeta {
  if (!isRecord(content)) return {};
  const rawMeta = content.meta;
  if (!isRecord(rawMeta)) return {};
  return {
    templateType:
      rawMeta.templateType === "home" || rawMeta.templateType === "article" || rawMeta.templateType === "landing"
        ? rawMeta.templateType
        : undefined,
    socialTitle: typeof rawMeta.socialTitle === "string" ? rawMeta.socialTitle : undefined,
    socialDescription: typeof rawMeta.socialDescription === "string" ? rawMeta.socialDescription : undefined,
    socialImageAlt: typeof rawMeta.socialImageAlt === "string" ? rawMeta.socialImageAlt : undefined,
  };
}

function buildContent(input: { html?: string; existing?: unknown; metaPatch?: PageMeta }) {
  const base: Record<string, unknown> = isRecord(input.existing)
    ? { ...(input.existing as Record<string, unknown>) }
    : {};
  const currentMeta = extractMeta(input.existing);
  const nextMeta: PageMeta = {
    templateType: input.metaPatch?.templateType ?? currentMeta.templateType,
    socialTitle: input.metaPatch?.socialTitle ?? currentMeta.socialTitle,
    socialDescription: input.metaPatch?.socialDescription ?? currentMeta.socialDescription,
    socialImageAlt: input.metaPatch?.socialImageAlt ?? currentMeta.socialImageAlt,
  };

  if (input.html !== undefined) {
    base.html = input.html;
  } else if (!("html" in base) && typeof input.existing === "string") {
    base.html = input.existing;
  }

  if (nextMeta.templateType || nextMeta.socialTitle || nextMeta.socialDescription || nextMeta.socialImageAlt) {
    const metaJson: Record<string, unknown> = {};
    if (nextMeta.templateType) metaJson.templateType = nextMeta.templateType;
    if (nextMeta.socialTitle) metaJson.socialTitle = nextMeta.socialTitle;
    if (nextMeta.socialDescription) metaJson.socialDescription = nextMeta.socialDescription;
    if (nextMeta.socialImageAlt) metaJson.socialImageAlt = nextMeta.socialImageAlt;
    base.meta = metaJson;
  } else {
    delete base.meta;
  }

  return base as Prisma.InputJsonValue;
}

export async function pageSlugExists(slug: string, excludeId?: string) {
  const dbData = await tryPrisma(async () => {
    const found = await prisma.pageTemplate.findFirst({
      where: excludeId ? { slug, id: { not: excludeId } } : { slug },
      select: { id: true },
    });
    return Boolean(found);
  });

  if (dbData !== null) return dbData;
  return mockStore.pages.some((item) => item.slug === slug && item.id !== excludeId);
}

export async function listPages() {
  const dbData = await tryPrisma(async () =>
    prisma.pageTemplate.findMany({
      orderBy: { createdAt: "desc" },
    }),
  );
  return dbData ?? mockStore.pages;
}

/** Published CMS pages for sitemap (excludes home slug "/"). */
export async function listPublishedPagesForSitemap(): Promise<
  Array<{ slug: string; updatedAt: Date }>
> {
  const dbData = await tryPrisma(async () =>
    prisma.pageTemplate.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  );

  const rows: Array<{ slug: string; updatedAt: Date }> = dbData
    ? dbData.map((row) => ({
        slug: row.slug,
        updatedAt: row.updatedAt,
      }))
    : mockStore.pages
        .filter((p) => p.status === "published")
        .map((row) => ({
          slug: row.slug,
          updatedAt: new Date(),
        }));

  return rows.filter((row) => {
    const slug = (row.slug || "").trim();
    return Boolean(slug) && slug !== "/";
  });
}

export const getPublishedPageBySlug = cache(async function getPublishedPageBySlug(slug: string) {
  const dbData = await tryPrisma(async () =>
    prisma.pageTemplate.findFirst({
      where: { slug, status: "published" },
    }),
  );
  if (dbData) return dbData;
  return mockStore.pages.find((item) => item.slug === slug && item.status === "published") ?? null;
});

export const getPageBySlug = cache(async function getPageBySlug(slug: string) {
  const dbData = await tryPrisma(async () =>
    prisma.pageTemplate.findFirst({
      where: { slug },
    }),
  );
  if (dbData) return dbData;
  return mockStore.pages.find((item) => item.slug === slug) ?? null;
});

export async function createPage(input: PageInput) {
  const dbData = await tryPrisma(async () => {
    const existing = await prisma.pageTemplate.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (existing) {
      throw new Error("SLUG_EXISTS");
    }

    const homeTemplate = await prisma.pageTemplate.findUnique({
      where: { slug: "/" },
      select: { content: true },
    });
    const clonedContent = homeTemplate?.content ?? {};
    const nextContent = buildContent({
      html: input.content !== undefined ? input.content : extractHtml(clonedContent),
      existing: clonedContent,
      metaPatch: {
        templateType: input.templateType,
        socialTitle: input.socialTitle,
        socialDescription: input.socialDescription,
        socialImageAlt: input.socialImageAlt,
      },
    });

    const page = await prisma.pageTemplate.create({
      data: {
        title: input.title,
        slug: input.slug,
        status: input.status,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        canonicalUrl: input.canonicalUrl,
        ogImageUrl: input.ogImageUrl,
        content: nextContent,
        publishAsNews: Boolean(input.publishAsNews),
      },
    });

    if (input.publishAsNews) {
      await prisma.newsPost.create({
        data: {
          title: input.title,
          slug: input.slug.replaceAll("/", "-").replace(/^-+/, "") || `page-${Date.now()}`,
          status: "published",
          content: typeof nextContent === "object" && nextContent ? nextContent : {},
        },
      });
    }

    return page;
  });

  if (dbData) return dbData;

  const homeTemplate = (mockStore.pages.find((item) => item.slug === "/") ??
    mockStore.pages[0]) as { content?: unknown } | undefined;
  const clonedContent = homeTemplate?.content ?? {};
  const nextContent = buildContent({
    html: input.content !== undefined ? input.content : extractHtml(clonedContent),
    existing: clonedContent,
    metaPatch: {
      templateType: input.templateType,
      socialTitle: input.socialTitle,
      socialDescription: input.socialDescription,
      socialImageAlt: input.socialImageAlt,
    },
  });

  const slugExists = mockStore.pages.some((item) => item.slug === input.slug);
  if (slugExists) {
    throw new Error("SLUG_EXISTS");
  }

  const page = {
    id: `p${Date.now()}`,
    ...input,
    canonicalUrl: input.canonicalUrl,
    ogImageUrl: input.ogImageUrl,
    content: nextContent,
  };
  mockStore.pages.unshift(page);
  if (input.publishAsNews) {
    mockStore.news.unshift({
      id: `n${Date.now()}`,
      title: input.title,
      slug: input.slug.replaceAll("/", "-").replace(/^-+/, "") || `page-${Date.now()}`,
      status: "published",
      content: typeof nextContent === "object" && nextContent ? nextContent : {},
    });
  }
  return page;
}

export async function updatePage(id: string, payload: Partial<PageInput>) {
  const dbData = await tryPrisma(async () => {
    const current = await prisma.pageTemplate.findUnique({
      where: { id },
      select: { id: true, content: true, slug: true },
    });
    if (!current) return null;

    if (payload.slug && payload.slug !== current.slug) {
      const duplicate = await prisma.pageTemplate.findFirst({
        where: { slug: payload.slug, id: { not: id } },
        select: { id: true },
      });
      if (duplicate) throw new Error("SLUG_EXISTS");
    }

    const shouldPatchContent =
      payload.content !== undefined ||
      payload.templateType !== undefined ||
      payload.socialTitle !== undefined ||
      payload.socialDescription !== undefined ||
      payload.socialImageAlt !== undefined;

    return prisma.pageTemplate.update({
      where: { id },
      data: {
        title: payload.title,
        slug: payload.slug,
        seoTitle: payload.seoTitle,
        seoDescription: payload.seoDescription,
        canonicalUrl: payload.canonicalUrl,
        ogImageUrl: payload.ogImageUrl,
        content: shouldPatchContent
          ? buildContent({
              html: payload.content,
              existing: current.content,
              metaPatch: {
                templateType: payload.templateType,
                socialTitle: payload.socialTitle,
                socialDescription: payload.socialDescription,
                socialImageAlt: payload.socialImageAlt,
              },
            })
          : undefined,
        status: payload.status,
      },
    });
  });
  if (dbData) return dbData;

  const page = mockStore.pages.find((item) => item.id === id);
  if (!page) return null;
  if (payload.slug && payload.slug !== page.slug) {
    const duplicate = mockStore.pages.find((item) => item.slug === payload.slug && item.id !== id);
    if (duplicate) throw new Error("SLUG_EXISTS");
  }

  if (payload.title !== undefined) page.title = payload.title;
  if (payload.slug !== undefined) page.slug = payload.slug;
  if (payload.status !== undefined) page.status = payload.status;
  if (payload.seoTitle !== undefined) page.seoTitle = payload.seoTitle;
  if (payload.seoDescription !== undefined) page.seoDescription = payload.seoDescription;
  if (payload.canonicalUrl !== undefined) page.canonicalUrl = payload.canonicalUrl;
  if (payload.ogImageUrl !== undefined) page.ogImageUrl = payload.ogImageUrl;

  const shouldPatchContent =
    payload.content !== undefined ||
    payload.templateType !== undefined ||
    payload.socialTitle !== undefined ||
    payload.socialDescription !== undefined ||
    payload.socialImageAlt !== undefined;

  if (shouldPatchContent) {
    page.content = buildContent({
      html: payload.content,
      existing: page.content,
      metaPatch: {
        templateType: payload.templateType,
        socialTitle: payload.socialTitle,
        socialDescription: payload.socialDescription,
        socialImageAlt: payload.socialImageAlt,
      },
    });
  }

  return page;
}

export async function deletePage(id: string) {
  const dbResult = await tryPrisma(async () => {
    await prisma.pageTemplate.delete({ where: { id } });
    return true;
  });
  if (dbResult) return true;

  const index = mockStore.pages.findIndex((item) => item.id === id);
  if (index === -1) return false;
  mockStore.pages.splice(index, 1);
  return true;
}
