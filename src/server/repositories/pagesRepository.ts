import { cache } from "react";
import { mockStore } from "@/src/server/mockStore";
import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";
import type { Prisma } from "@prisma/client";
import { sanitizeHtml } from "@/src/lib/sanitizeHtml";
import { toCanonicalUrl } from "@/src/lib/siteUrl";

type TemplateType = "home" | "article" | "landing";
type CloneGame = "bgmi" | "pubg" | "freefire" | "freefire-max";

type PageInput = {
  title: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  templateType?: TemplateType;
  /** Calculator game for home-style clones. Defaults to bgmi. */
  game?: CloneGame;
  socialTitle?: string;
  socialDescription?: string;
  socialImageAlt?: string;
  /** Comma-separated meta keywords. */
  metaKeywords?: string;
  content?: string;
  status: "draft" | "published";
  publishAsNews?: boolean;
};

type PageMeta = {
  templateType?: TemplateType;
  game?: CloneGame;
  socialTitle?: string;
  socialDescription?: string;
  socialImageAlt?: string;
  keywords?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Store clone slugs without a leading slash; public URLs already include `/`. */
function normalizePageSlug(slug: string) {
  return slug.trim().replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase();
}

function pageSlugVariants(slug: string) {
  const normalized = normalizePageSlug(slug);
  if (!normalized) return slug.trim() ? [slug.trim()] : [];
  return Array.from(new Set([normalized, `/${normalized}`]));
}

function resolveCanonicalUrl(slug: string, canonicalUrl?: string | null) {
  const trimmed = canonicalUrl?.trim();
  if (trimmed) return trimmed;
  const normalized = normalizePageSlug(slug);
  return toCanonicalUrl(normalized ? `/${normalized}` : "/");
}

function coerceCloneGame(value: unknown): CloneGame | undefined {
  return value === "pubg" || value === "bgmi" || value === "freefire" || value === "freefire-max"
    ? value
    : undefined;
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
    game: coerceCloneGame(rawMeta.game),
    socialTitle: typeof rawMeta.socialTitle === "string" ? rawMeta.socialTitle : undefined,
    socialDescription: typeof rawMeta.socialDescription === "string" ? rawMeta.socialDescription : undefined,
    socialImageAlt: typeof rawMeta.socialImageAlt === "string" ? rawMeta.socialImageAlt : undefined,
    keywords: typeof rawMeta.keywords === "string" ? rawMeta.keywords : undefined,
  };
}

function buildContent(input: { html?: string; existing?: unknown; metaPatch?: PageMeta }) {
  const base: Record<string, unknown> = isRecord(input.existing)
    ? { ...(input.existing as Record<string, unknown>) }
    : {};
  const currentMeta = extractMeta(input.existing);
  const nextMeta: PageMeta = {
    templateType: input.metaPatch?.templateType ?? currentMeta.templateType,
    game: input.metaPatch?.game ?? currentMeta.game,
    socialTitle: input.metaPatch?.socialTitle ?? currentMeta.socialTitle,
    socialDescription: input.metaPatch?.socialDescription ?? currentMeta.socialDescription,
    socialImageAlt: input.metaPatch?.socialImageAlt ?? currentMeta.socialImageAlt,
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
    nextMeta.templateType ||
    nextMeta.game ||
    nextMeta.socialTitle ||
    nextMeta.socialDescription ||
    nextMeta.socialImageAlt ||
    nextMeta.keywords?.trim()
  ) {
    const metaJson: Record<string, unknown> = {};
    if (nextMeta.templateType) metaJson.templateType = nextMeta.templateType;
    if (nextMeta.game) metaJson.game = nextMeta.game;
    if (nextMeta.socialTitle) metaJson.socialTitle = nextMeta.socialTitle;
    if (nextMeta.socialDescription) metaJson.socialDescription = nextMeta.socialDescription;
    if (nextMeta.socialImageAlt) metaJson.socialImageAlt = nextMeta.socialImageAlt;
    if (nextMeta.keywords?.trim()) metaJson.keywords = nextMeta.keywords.trim();
    base.meta = metaJson;
  } else {
    delete base.meta;
  }

  return base as Prisma.InputJsonValue;
}

export async function pageSlugExists(slug: string, excludeId?: string) {
  const variants = pageSlugVariants(slug);
  if (!variants.length) return false;

  const dbData = await tryPrisma(async () => {
    const found = await prisma.pageTemplate.findFirst({
      where: excludeId
        ? { slug: { in: variants }, id: { not: excludeId } }
        : { slug: { in: variants } },
      select: { id: true },
    });
    return Boolean(found);
  });

  if (dbData !== null) return dbData;
  return mockStore.pages.some(
    (item) => variants.includes(item.slug) && item.id !== excludeId,
  );
}

function normalizeComparableTitle(title: string) {
  return title.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function pageTitleExists(title: string, excludeId?: string) {
  const normalized = normalizeComparableTitle(title);
  if (!normalized) return false;

  const dbData = await tryPrisma(async () => {
    const rows = await prisma.pageTemplate.findMany({
      where: excludeId ? { id: { not: excludeId } } : undefined,
      select: { id: true, title: true },
    });
    return rows.some((row) => normalizeComparableTitle(row.title) === normalized);
  });

  if (dbData !== null) return dbData;
  return mockStore.pages.some(
    (item) =>
      normalizeComparableTitle(item.title) === normalized && item.id !== excludeId,
  );
}

export async function listPages() {
  const dbData = await tryPrismaLong(async () =>
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
  const slug = normalizePageSlug(input.slug);
  if (!slug) {
    throw new Error("INVALID_SLUG");
  }

  const dbData = await tryPrismaLong(async () => {
    const existing = await prisma.pageTemplate.findFirst({
      where: { slug: { in: pageSlugVariants(slug) } },
      select: { id: true },
    });
    if (existing) {
      throw new Error("SLUG_EXISTS");
    }
    if (await pageTitleExists(input.title)) {
      throw new Error("TITLE_EXISTS");
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
        game: input.game ?? "bgmi",
        socialTitle: input.socialTitle,
        socialDescription: input.socialDescription,
        socialImageAlt: input.socialImageAlt,
        keywords: input.metaKeywords ?? "",
      },
    });

    const page = await prisma.pageTemplate.create({
      data: {
        title: input.title,
        slug,
        status: input.status,
        seoTitle: input.seoTitle,
        seoDescription: input.seoDescription,
        canonicalUrl: resolveCanonicalUrl(slug, input.canonicalUrl),
        ogImageUrl: input.ogImageUrl,
        content: nextContent,
        publishAsNews: Boolean(input.publishAsNews),
      },
    });

    if (input.publishAsNews) {
      await prisma.newsPost.create({
        data: {
          title: input.title,
          slug: slug.replaceAll("/", "-").replace(/^-+/, "") || `page-${Date.now()}`,
          status: "published",
          content: typeof nextContent === "object" && nextContent ? nextContent : {},
        },
      });
    }

    return page;
  });

  if (dbData) return dbData;

  if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
    throw new Error("DB_UNAVAILABLE");
  }

  const homeTemplate = (mockStore.pages.find((item) => item.slug === "/") ??
    mockStore.pages[0]) as { content?: unknown } | undefined;
  const clonedContent = homeTemplate?.content ?? {};
  const nextContent = buildContent({
    html: input.content !== undefined ? input.content : extractHtml(clonedContent),
    existing: clonedContent,
    metaPatch: {
      templateType: input.templateType,
      game: input.game ?? "bgmi",
      socialTitle: input.socialTitle,
      socialDescription: input.socialDescription,
      socialImageAlt: input.socialImageAlt,
      keywords: input.metaKeywords ?? "",
    },
  });

  const slugExists = mockStore.pages.some((item) => pageSlugVariants(slug).includes(item.slug));
  if (slugExists) {
    throw new Error("SLUG_EXISTS");
  }
  if (await pageTitleExists(input.title)) {
    throw new Error("TITLE_EXISTS");
  }

  const page = {
    id: `p${Date.now()}`,
    ...input,
    slug,
    canonicalUrl: resolveCanonicalUrl(slug, input.canonicalUrl),
    ogImageUrl: input.ogImageUrl,
    content: nextContent,
  };
  mockStore.pages.unshift(page);
  if (input.publishAsNews) {
    mockStore.news.unshift({
      id: `n${Date.now()}`,
      title: input.title,
      slug: slug.replaceAll("/", "-").replace(/^-+/, "") || `page-${Date.now()}`,
      status: "published",
      content: typeof nextContent === "object" && nextContent ? nextContent : {},
    });
  }
  return page;
}

export async function updatePage(id: string, payload: Partial<PageInput>) {
  const normalizedSlug =
    payload.slug !== undefined ? normalizePageSlug(payload.slug) : undefined;
  if (payload.slug !== undefined && !normalizedSlug) {
    throw new Error("INVALID_SLUG");
  }
  const nextPayload =
    normalizedSlug !== undefined ? { ...payload, slug: normalizedSlug } : payload;

  const dbData = await tryPrismaLong(async () => {
    const current = await prisma.pageTemplate.findUnique({
      where: { id },
      select: { id: true, content: true, slug: true },
    });
    if (!current) return { kind: "not_found" as const };

    if (nextPayload.slug && nextPayload.slug !== current.slug) {
      const duplicate = await prisma.pageTemplate.findFirst({
        where: {
          slug: { in: pageSlugVariants(nextPayload.slug) },
          id: { not: id },
        },
        select: { id: true },
      });
      if (duplicate) throw new Error("SLUG_EXISTS");
    }
    if (nextPayload.title !== undefined && (await pageTitleExists(nextPayload.title, id))) {
      throw new Error("TITLE_EXISTS");
    }

    const shouldPatchContent =
      nextPayload.content !== undefined ||
      nextPayload.templateType !== undefined ||
      nextPayload.game !== undefined ||
      nextPayload.socialTitle !== undefined ||
      nextPayload.socialDescription !== undefined ||
      nextPayload.socialImageAlt !== undefined ||
      nextPayload.metaKeywords !== undefined;

    const resolvedCanonical =
      nextPayload.canonicalUrl !== undefined
        ? resolveCanonicalUrl(nextPayload.slug ?? current.slug, nextPayload.canonicalUrl)
        : undefined;

    const page = await prisma.pageTemplate.update({
      where: { id },
      data: {
        title: nextPayload.title,
        slug: nextPayload.slug,
        seoTitle: nextPayload.seoTitle,
        seoDescription: nextPayload.seoDescription,
        canonicalUrl: resolvedCanonical,
        ogImageUrl: nextPayload.ogImageUrl,
        content: shouldPatchContent
          ? buildContent({
              html: nextPayload.content,
              existing: current.content,
              metaPatch: {
                templateType: nextPayload.templateType,
                game: nextPayload.game,
                socialTitle: nextPayload.socialTitle,
                socialDescription: nextPayload.socialDescription,
                socialImageAlt: nextPayload.socialImageAlt,
                keywords: nextPayload.metaKeywords,
              },
            })
          : undefined,
        status: nextPayload.status,
      },
    });
    return { kind: "ok" as const, page };
  });

  if (dbData?.kind === "ok") return dbData.page;
  if (dbData?.kind === "not_found") return null;

  if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
    throw new Error("DB_UNAVAILABLE");
  }

  const page = mockStore.pages.find((item) => item.id === id);
  if (!page) return null;
  if (nextPayload.slug && nextPayload.slug !== page.slug) {
    const duplicate = mockStore.pages.find(
      (item) => pageSlugVariants(nextPayload.slug!).includes(item.slug) && item.id !== id,
    );
    if (duplicate) throw new Error("SLUG_EXISTS");
  }
  if (nextPayload.title !== undefined && (await pageTitleExists(nextPayload.title, id))) {
    throw new Error("TITLE_EXISTS");
  }

  if (nextPayload.title !== undefined) page.title = nextPayload.title;
  if (nextPayload.slug !== undefined) page.slug = nextPayload.slug;
  if (nextPayload.status !== undefined) page.status = nextPayload.status;
  if (nextPayload.seoTitle !== undefined) page.seoTitle = nextPayload.seoTitle;
  if (nextPayload.seoDescription !== undefined) page.seoDescription = nextPayload.seoDescription;
  if (nextPayload.canonicalUrl !== undefined) {
    page.canonicalUrl = resolveCanonicalUrl(nextPayload.slug ?? page.slug, nextPayload.canonicalUrl);
  }
  if (nextPayload.ogImageUrl !== undefined) page.ogImageUrl = nextPayload.ogImageUrl;

  const shouldPatchContent =
    nextPayload.content !== undefined ||
    nextPayload.templateType !== undefined ||
    nextPayload.game !== undefined ||
    nextPayload.socialTitle !== undefined ||
    nextPayload.socialDescription !== undefined ||
    nextPayload.socialImageAlt !== undefined ||
    nextPayload.metaKeywords !== undefined;

  if (shouldPatchContent) {
    page.content = buildContent({
      html: nextPayload.content,
      existing: page.content,
      metaPatch: {
        templateType: nextPayload.templateType,
        game: nextPayload.game,
        socialTitle: nextPayload.socialTitle,
        socialDescription: nextPayload.socialDescription,
        socialImageAlt: nextPayload.socialImageAlt,
        keywords: nextPayload.metaKeywords,
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

/** Ensure Free Fire CMS article pages exist and stay in sync with code defaults. */
export async function ensureFreeFireCmsPages() {
  const { freeFireConfig } = await import("@/src/lib/freeFirePages");
  for (const variant of ["freefire", "freefire-max"] as const) {
    const cfg = freeFireConfig(variant);
    const existing =
      (await getPageBySlug(cfg.slug)) ?? (await getPageBySlug(`/${cfg.slug}`));
    if (existing) {
      const currentHtml = extractHtml(existing.content);
      const staleSeo =
        !existing.seoDescription?.trim() ||
        /coming soon|in development|update soon/i.test(existing.seoDescription);
      const patch: {
        content?: string;
        seoDescription?: string;
        seoTitle?: string;
        title?: string;
        status?: "published";
      } = {};
      if (currentHtml !== cfg.defaultArticleHtml) {
        patch.content = cfg.defaultArticleHtml;
      }
      if (staleSeo) {
        patch.seoDescription = cfg.seoDescription;
      }
      if (!existing.seoTitle?.trim()) {
        patch.seoTitle = cfg.title;
      }
      if (existing.status !== "published") {
        patch.status = "published";
      }
      if (Object.keys(patch).length > 0) {
        try {
          await updatePage(existing.id, patch);
        } catch {
          /* DB unavailable — page still uses code default on render */
        }
      }
      continue;
    }
    try {
      await createPage({
        title: cfg.title,
        slug: cfg.slug,
        seoTitle: cfg.title,
        seoDescription: cfg.seoDescription,
        templateType: "landing",
        content: cfg.defaultArticleHtml,
        status: "published",
        publishAsNews: false,
      });
    } catch {
      /* race / already exists */
    }
  }
}
