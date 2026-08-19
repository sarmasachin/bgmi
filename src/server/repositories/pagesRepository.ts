import { cache } from "react";
import { mockStore } from "@/src/server/mockStore";
import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";
import type { Prisma } from "@prisma/client";
import { sanitizeHtml } from "@/src/lib/sanitizeHtml";
import { newsArticlePath, newsCategoryFromCloneGame } from "@/src/lib/newsCategories";
import { toCanonicalUrl } from "@/src/lib/siteUrl";

type TemplateType = "home" | "article" | "landing";
type CloneGame = "bgmi" | "pubg" | "freefire" | "freefire-max" | "pubg-mobile-codes";

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
  return value === "pubg" ||
    value === "bgmi" ||
    value === "freefire" ||
    value === "freefire-max" ||
    value === "pubg-mobile-codes"
    ? value
    : undefined;
}

function extractHtml(content: unknown) {
  if (typeof content === "string") return content;
  if (isRecord(content) && typeof content.html === "string") return content.html;
  return "";
}

function newsSlugFromPageSlug(slug: string) {
  return (
    normalizePageSlug(slug).replaceAll("/", "-").replace(/^-+/, "") || `page-${Date.now()}`
  );
}

/** Create or refresh a News post from a page clone (Publish in News). */
async function upsertNewsFromPage(input: {
  title: string;
  pageSlug: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImageUrl?: string | null;
  socialTitle?: string | null;
  socialDescription?: string | null;
  socialImageAlt?: string | null;
  metaKeywords?: string | null;
  pageContent: unknown;
}) {
  const newsSlug = newsSlugFromPageSlug(input.pageSlug);
  let html = extractHtml(input.pageContent).trim();
  if (!html) {
    const desc = (input.seoDescription || input.socialDescription || "").trim();
    const safeTitle = input.title.trim() || "Update";
    html = desc
      ? `<p>${desc}</p><p><a href="/${normalizePageSlug(input.pageSlug)}">Open ${safeTitle}</a></p>`
      : `<p>${safeTitle}</p><p><a href="/${normalizePageSlug(input.pageSlug)}">Open page</a></p>`;
  }

  const primaryCategory = newsCategoryFromCloneGame(extractMeta(input.pageContent).game);

  const content = {
    html: sanitizeHtml(html),
    meta: {
      ...(input.socialTitle?.trim() ? { socialTitle: input.socialTitle.trim() } : {}),
      ...(input.socialDescription?.trim()
        ? { socialDescription: input.socialDescription.trim() }
        : {}),
      ...(input.socialImageAlt?.trim() ? { socialImageAlt: input.socialImageAlt.trim() } : {}),
      ...(input.ogImageUrl?.trim() ? { ogImageUrl: input.ogImageUrl.trim() } : {}),
      ...(input.metaKeywords?.trim() ? { keywords: input.metaKeywords.trim() } : {}),
      canonicalUrl: toCanonicalUrl(newsArticlePath(primaryCategory, newsSlug)),
    },
  } as Prisma.InputJsonValue;

  const data = {
    title: input.title,
    slug: newsSlug,
    status: "published",
    primaryCategory,
    seoTitle: input.seoTitle?.trim() || null,
    seoDescription: input.seoDescription?.trim() || null,
    featureImage: input.ogImageUrl?.trim() || null,
    content,
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

/** Hide news created from a page clone when Publish in News is unchecked. */
async function unpublishNewsFromPageSlug(pageSlug: string) {
  const newsSlug = newsSlugFromPageSlug(pageSlug);
  const result = await prisma.newsPost.updateMany({
    where: { slug: newsSlug, status: "published" },
    data: { status: "draft" },
  });
  return { newsSlug, unpublished: result.count > 0 };
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
  await dedupeDuplicatePageSlugs();
  const { FREE_FIRE_SLUG } = await import("@/src/lib/freeFirePages");
  await deletePagesBySlugVariants(FREE_FIRE_SLUG);
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
  const dbData = await tryPrismaLong(async () =>
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
          updatedAt:
            row.updatedAt instanceof Date
              ? row.updatedAt
              : typeof row.updatedAt === "string"
                ? new Date(row.updatedAt)
                : new Date(0),
        }))
        .filter((row) => !Number.isNaN(row.updatedAt.getTime()) && row.updatedAt.getTime() > 0);

  return rows.filter((row) => {
    const slug = (row.slug || "").trim();
    return Boolean(slug) && slug !== "/";
  });
}

export const getPublishedPageBySlug = cache(async function getPublishedPageBySlug(slug: string) {
  const variants = pageSlugVariants(slug);
  const dbData = await tryPrisma(async () =>
    prisma.pageTemplate.findFirst({
      where: { slug: { in: variants }, status: "published" },
    }),
  );
  if (dbData) return dbData;
  return (
    mockStore.pages.find(
      (item) => variants.includes(item.slug) && item.status === "published",
    ) ?? null
  );
});

export const getPageBySlug = cache(async function getPageBySlug(slug: string) {
  const variants = pageSlugVariants(slug);
  const dbData = await tryPrisma(async () =>
    prisma.pageTemplate.findFirst({
      where: { slug: { in: variants } },
    }),
  );
  if (dbData) return dbData;
  return mockStore.pages.find((item) => variants.includes(item.slug)) ?? null;
});

type PageSlugRow = {
  id: string;
  slug: string;
  status: string;
  updatedAt: Date;
  createdAt: Date;
  game?: CloneGame;
};

function expectedGameForNormalizedSlug(normalized: string): CloneGame | undefined {
  if (normalized === "free-fire-sensitivity-settings-calculator") return "freefire";
  if (normalized === "free-fire-max-sensitivity-settings-calculator") return "freefire-max";
  if (normalized === "bgmi") return "bgmi";
  if (normalized === "pubg") return "pubg";
  if (normalized === "pubg-mobile-codes") return "pubg-mobile-codes";
  return undefined;
}

function pickPreferredPageSlugRow(rows: PageSlugRow[], normalized: string) {
  const expectedGame = expectedGameForNormalizedSlug(normalized);
  return [...rows].sort((a, b) => {
    if (expectedGame) {
      const gameRank =
        Number(b.game === expectedGame) - Number(a.game === expectedGame);
      if (gameRank !== 0) return gameRank;
    }
    const published = Number(b.status === "published") - Number(a.status === "published");
    if (published !== 0) return published;
    const normalizedSlug = Number(a.slug === normalized) - Number(b.slug === normalized);
    if (normalizedSlug !== 0) return normalizedSlug;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  })[0]!;
}

/**
 * Collapse `slug` vs `/slug` (and other normalize collisions) to one row each,
 * and rewrite survivors to the slash-free canonical slug.
 */
export async function dedupeDuplicatePageSlugs() {
  const dbResult = await tryPrismaLong(async () => {
    const rows = await prisma.pageTemplate.findMany({
      select: {
        id: true,
        slug: true,
        status: true,
        updatedAt: true,
        createdAt: true,
        content: true,
      },
    });

    const mapped: PageSlugRow[] = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      status: row.status,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
      game: extractMeta(row.content).game,
    }));

    const groups = new Map<string, PageSlugRow[]>();
    for (const row of mapped) {
      const key = normalizePageSlug(row.slug);
      if (!key) continue;
      const list = groups.get(key) ?? [];
      list.push(row);
      groups.set(key, list);
    }

    let deleted = 0;
    for (const [key, list] of groups) {
      const keep = pickPreferredPageSlugRow(list, key);
      for (const drop of list) {
        if (drop.id === keep.id) continue;
        await prisma.pageTemplate.delete({ where: { id: drop.id } });
        deleted += 1;
      }
      if (keep.slug !== key) {
        // Avoid unique conflicts if a stray row reappeared with the target slug.
        const clash = await prisma.pageTemplate.findFirst({
          where: { slug: key, id: { not: keep.id } },
          select: { id: true },
        });
        if (clash) {
          await prisma.pageTemplate.delete({ where: { id: clash.id } });
          deleted += 1;
        }
        await prisma.pageTemplate.update({
          where: { id: keep.id },
          data: { slug: key },
        });
      }
    }
    return deleted;
  });

  if (dbResult !== null) return dbResult;

  const groups = new Map<string, typeof mockStore.pages>();
  for (const row of mockStore.pages) {
    const key = normalizePageSlug(row.slug);
    if (!key) continue;
    const list = groups.get(key) ?? [];
    list.push(row);
    groups.set(key, list);
  }

  let deleted = 0;
  for (const [key, list] of groups) {
    const keep = pickPreferredPageSlugRow(
      list.map((row) => ({
        id: row.id,
        slug: row.slug,
        status: row.status,
        updatedAt: new Date(0),
        createdAt: new Date(0),
        game: extractMeta(row.content).game,
      })),
      key,
    );
    for (const drop of list) {
      if (drop.id === keep.id) continue;
      const index = mockStore.pages.findIndex((item) => item.id === drop.id);
      if (index !== -1) {
        mockStore.pages.splice(index, 1);
        deleted += 1;
      }
    }
    const kept = mockStore.pages.find((item) => item.id === keep.id);
    if (kept && kept.slug !== key) kept.slug = key;
  }
  return deleted;
}

/** Delete every page row matching slug or `/slug` (used for obsolete redirect shells). */
async function deletePagesBySlugVariants(slug: string) {
  const variants = pageSlugVariants(slug);
  if (!variants.length) return 0;

  const dbResult = await tryPrismaLong(async () => {
    const result = await prisma.pageTemplate.deleteMany({
      where: { slug: { in: variants } },
    });
    return result.count;
  });
  if (dbResult !== null) return dbResult;

  let deleted = 0;
  for (let i = mockStore.pages.length - 1; i >= 0; i -= 1) {
    if (variants.includes(mockStore.pages[i]!.slug)) {
      mockStore.pages.splice(i, 1);
      deleted += 1;
    }
  }
  return deleted;
}

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
      try {
        await upsertNewsFromPage({
          title: input.title,
          pageSlug: slug,
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          ogImageUrl: input.ogImageUrl,
          socialTitle: input.socialTitle,
          socialDescription: input.socialDescription,
          socialImageAlt: input.socialImageAlt,
          metaKeywords: input.metaKeywords,
          pageContent: nextContent,
        });
      } catch {
        // Page create must succeed even if news sync fails; admin can retry Update.
      }
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
    const newsSlug = slug.replaceAll("/", "-").replace(/^-+/, "") || `page-${Date.now()}`;
    const primaryCategory = newsCategoryFromCloneGame(input.game);
    mockStore.news.unshift({
      id: `n${Date.now()}`,
      title: input.title,
      slug: newsSlug,
      status: "published",
      primaryCategory,
      extraCategories: [],
      content: typeof nextContent === "object" && nextContent ? nextContent : {},
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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

    const nextContent = shouldPatchContent
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
        content: nextContent,
        status: nextPayload.status,
        ...(nextPayload.publishAsNews !== undefined
          ? { publishAsNews: Boolean(nextPayload.publishAsNews) }
          : {}),
      },
    });

    return { kind: "ok" as const, page, contentForNews: nextContent ?? current.content };
  });

  if (dbData?.kind === "not_found") return null;
  if (!dbData || dbData.kind !== "ok") {
    if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL) {
      throw new Error("DB_UNAVAILABLE");
    }
  }

  if (dbData?.kind === "ok") {
    let newsPublished = false;
    let newsUnpublished = false;
    let newsError: string | undefined;
    if (nextPayload.publishAsNews === true) {
      try {
        const meta = extractMeta(dbData.contentForNews);
        await upsertNewsFromPage({
          title: dbData.page.title,
          pageSlug: dbData.page.slug,
          seoTitle: dbData.page.seoTitle,
          seoDescription: dbData.page.seoDescription,
          ogImageUrl: dbData.page.ogImageUrl,
          socialTitle: nextPayload.socialTitle ?? meta.socialTitle,
          socialDescription: nextPayload.socialDescription ?? meta.socialDescription,
          socialImageAlt: nextPayload.socialImageAlt ?? meta.socialImageAlt,
          metaKeywords: nextPayload.metaKeywords ?? meta.keywords,
          pageContent: dbData.contentForNews,
        });
        newsPublished = true;
      } catch (error) {
        newsError =
          error instanceof Error && error.message
            ? `Publish in News failed: ${error.message}`
            : "Publish in News failed. Clone was saved, but news was not created.";
      }
    } else if (nextPayload.publishAsNews === false) {
      try {
        const result = await unpublishNewsFromPageSlug(dbData.page.slug);
        newsUnpublished = result.unpublished;
      } catch (error) {
        newsError =
          error instanceof Error && error.message
            ? `Unpublish from News failed: ${error.message}`
            : "Clone was saved, but linked news could not be unpublished.";
      }
    }
    return { page: dbData.page, newsPublished, newsUnpublished, newsError };
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
  if (nextPayload.publishAsNews !== undefined) page.publishAsNews = Boolean(nextPayload.publishAsNews);

  const shouldPatchContentMock =
    nextPayload.content !== undefined ||
    nextPayload.templateType !== undefined ||
    nextPayload.game !== undefined ||
    nextPayload.socialTitle !== undefined ||
    nextPayload.socialDescription !== undefined ||
    nextPayload.socialImageAlt !== undefined ||
    nextPayload.metaKeywords !== undefined;

  if (shouldPatchContentMock) {
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

  let newsPublished = false;
  let newsUnpublished = false;
  let newsError: string | undefined;
  if (nextPayload.publishAsNews === true) {
    try {
      const newsSlug = newsSlugFromPageSlug(page.slug);
      const html =
        extractHtml(page.content).trim() ||
        `<p>${page.title}</p><p><a href="/${normalizePageSlug(page.slug)}">Open page</a></p>`;
      const existingIdx = mockStore.news.findIndex((item) => item.slug === newsSlug);
      const newsItem = {
        id: existingIdx >= 0 ? mockStore.news[existingIdx]!.id : `n${Date.now()}`,
        title: page.title,
        slug: newsSlug,
        status: "published",
        primaryCategory: newsCategoryFromCloneGame(extractMeta(page.content).game),
        extraCategories: [],
        content: { html },
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (existingIdx >= 0) mockStore.news[existingIdx] = newsItem;
      else mockStore.news.unshift(newsItem);
      newsPublished = true;
    } catch (error) {
      newsError =
        error instanceof Error && error.message
          ? `Publish in News failed: ${error.message}`
          : "Publish in News failed. Clone was saved, but news was not created.";
    }
  } else if (nextPayload.publishAsNews === false) {
    const newsSlug = newsSlugFromPageSlug(page.slug);
    const existing = mockStore.news.find((item) => item.slug === newsSlug);
    if (existing && existing.status === "published") {
      existing.status = "draft";
      newsUnpublished = true;
    }
  }

  return { page, newsPublished, newsUnpublished, newsError };
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

/**
 * Ensure Free Fire Max CMS page shell exists (SEO / sitemap / status).
 * Plain FF calculator slug redirects to `/` — those shells are removed.
 * Article body is owned by Game Articles — not synced here.
 */
export async function ensureFreeFireCmsPages() {
  await dedupeDuplicatePageSlugs();
  const { FREE_FIRE_SLUG, freeFireConfig } = await import("@/src/lib/freeFirePages");
  await deletePagesBySlugVariants(FREE_FIRE_SLUG);

  const variant = "freefire-max" as const;
  const cfg = freeFireConfig(variant);
  const existing = await getPageBySlug(cfg.slug);
  if (existing) {
    const currentGame = extractMeta(existing.content).game;
    const staleSeo =
      !existing.seoDescription?.trim() ||
      /coming soon|in development|update soon/i.test(existing.seoDescription);
    const patch: Partial<PageInput> = {};
    if (staleSeo) {
      patch.seoDescription = cfg.seoDescription;
    }
    if (!existing.seoTitle?.trim()) {
      patch.seoTitle = cfg.title;
    }
    if (existing.status !== "published") {
      patch.status = "published";
    }
    if (existing.slug !== cfg.slug) {
      patch.slug = cfg.slug;
    }
    if (currentGame !== variant) {
      patch.game = variant;
    }
    if (Object.keys(patch).length > 0) {
      try {
        await updatePage(existing.id, patch);
      } catch {
        /* DB unavailable — page still uses code default on render */
      }
    }
    return;
  }
  try {
    await createPage({
      title: cfg.title,
      slug: cfg.slug,
      seoTitle: cfg.title,
      seoDescription: cfg.seoDescription,
      templateType: "landing",
      game: variant,
      content: "",
      status: "published",
      publishAsNews: false,
    });
  } catch {
    /* race / already exists */
  }
}
