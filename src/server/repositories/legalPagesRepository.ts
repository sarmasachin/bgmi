import { cache } from "react";
import { mockStore } from "@/src/server/mockStore";
import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";
import { sanitizeHtml } from "@/src/lib/sanitizeHtml";
import {
  CORE_LEGAL_SLUGS,
  defaultHtmlForSlug,
  defaultSeoForSlug,
  defaultTitleForSlug,
  isCoreLegalSlug,
  normalizeLegalSlug,
  RESERVED_APP_SLUGS,
} from "@/src/lib/legalPages";

export type LegalPageStatus = "draft" | "published";

export type LegalPageInput = {
  title: string;
  slug: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: LegalPageStatus;
};

export type LegalPageRecord = {
  id: string;
  title: string;
  slug: string;
  content: unknown;
  seoTitle: string | null;
  seoDescription: string | null;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export {
  CORE_LEGAL_SLUGS,
  defaultHtmlForSlug,
  defaultSeoForSlug,
  defaultTitleForSlug,
  isCoreLegalSlug,
  normalizeLegalSlug,
} from "@/src/lib/legalPages";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function extractLegalHtml(content: unknown) {
  if (typeof content === "string") return content;
  if (isRecord(content) && typeof content.html === "string") return content.html;
  return "";
}

function buildContent(html?: string) {
  return { html: sanitizeHtml(html ?? "") };
}

export async function legalSlugExists(slug: string, excludeId?: string) {
  const normalized = normalizeLegalSlug(slug);
  if (!normalized) return false;

  const dbHit = await tryPrisma(async () => {
    const row = await prisma.legalPage.findFirst({
      where: {
        slug: normalized,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    return Boolean(row);
  });
  if (dbHit !== null) return dbHit;

  return mockStore.legalPages.some(
    (row) => row.slug === normalized && row.id !== excludeId,
  );
}

export async function listLegalPages() {
  const dbData = await tryPrisma(async () =>
    prisma.legalPage.findMany({ orderBy: { updatedAt: "desc" } }),
  );
  return dbData ?? mockStore.legalPages;
}

export const getPublishedLegalPageBySlug = cache(async (slug: string) => {
  const normalized = normalizeLegalSlug(slug);
  if (!normalized) return null;

  const dbData = await tryPrisma(async () =>
    prisma.legalPage.findFirst({
      where: { slug: normalized, status: "published" },
    }),
  );
  if (dbData) return dbData;

  return (
    mockStore.legalPages.find(
      (row) => row.slug === normalized && row.status === "published",
    ) ?? null
  );
});

export const getLegalPageBySlug = cache(async (slug: string) => {
  const normalized = normalizeLegalSlug(slug);
  if (!normalized) return null;

  const dbData = await tryPrisma(async () =>
    prisma.legalPage.findFirst({ where: { slug: normalized } }),
  );
  if (dbData) return dbData;

  return mockStore.legalPages.find((row) => row.slug === normalized) ?? null;
});

export async function getLegalPageById(id: string) {
  const dbData = await tryPrisma(async () =>
    prisma.legalPage.findUnique({ where: { id } }),
  );
  if (dbData) return dbData;
  return mockStore.legalPages.find((row) => row.id === id) ?? null;
}

export async function createLegalPage(input: LegalPageInput) {
  const slug = normalizeLegalSlug(input.slug);
  if (!slug) throw new Error("INVALID_SLUG");
  // Custom pages cannot steal core app routes; core legal slugs are allowed.
  if (!isCoreLegalSlug(slug) && RESERVED_APP_SLUGS.has(slug)) {
    throw new Error("INVALID_SLUG");
  }
  if (await legalSlugExists(slug)) throw new Error("SLUG_EXISTS");

  const title = input.title.trim() || defaultTitleForSlug(slug);
  const seo = defaultSeoForSlug(slug);
  const html =
    input.content?.trim() ||
    (isCoreLegalSlug(slug) ? defaultHtmlForSlug(slug) : "<p></p>");
  const data = {
    title,
    slug,
    content: buildContent(html),
    seoTitle: input.seoTitle?.trim() || seo.seoTitle,
    seoDescription: input.seoDescription?.trim() || seo.seoDescription,
    status: (input.status ?? "draft") as string,
  };

  const dbData = await tryPrismaLong(async () =>
    prisma.legalPage.create({ data }),
  );
  if (dbData) return dbData;
  if (process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");

  const item: LegalPageRecord = {
    id: `lp${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockStore.legalPages.unshift(item);
  return item;
}

export async function updateLegalPage(id: string, payload: Partial<LegalPageInput>) {
  const existing = await getLegalPageById(id);
  if (!existing) return null;

  const nextSlug =
    payload.slug !== undefined ? normalizeLegalSlug(payload.slug) : existing.slug;
  if (!nextSlug) throw new Error("INVALID_SLUG");
  if (!isCoreLegalSlug(nextSlug) && RESERVED_APP_SLUGS.has(nextSlug)) {
    throw new Error("INVALID_SLUG");
  }
  if (await legalSlugExists(nextSlug, id)) throw new Error("SLUG_EXISTS");

  const data: {
    title?: string;
    slug?: string;
    content?: { html: string };
    seoTitle?: string | null;
    seoDescription?: string | null;
    status?: string;
  } = {};

  if (payload.title !== undefined) data.title = payload.title.trim() || existing.title;
  if (payload.slug !== undefined) data.slug = nextSlug;
  if (payload.content !== undefined) data.content = buildContent(payload.content);
  if (payload.seoTitle !== undefined) data.seoTitle = payload.seoTitle.trim() || null;
  if (payload.seoDescription !== undefined) {
    data.seoDescription = payload.seoDescription.trim() || null;
  }
  if (payload.status !== undefined) data.status = payload.status;

  const dbData = await tryPrismaLong(async () =>
    prisma.legalPage.update({ where: { id }, data }),
  );
  if (dbData) return dbData;
  if (process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");

  const item = mockStore.legalPages.find((row) => row.id === id);
  if (!item) return null;
  if (data.title !== undefined) item.title = data.title;
  if (data.slug !== undefined) item.slug = data.slug;
  if (data.content !== undefined) item.content = data.content;
  if (data.seoTitle !== undefined) item.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined) item.seoDescription = data.seoDescription;
  if (data.status !== undefined) item.status = data.status;
  item.updatedAt = new Date().toISOString();
  return item;
}

export async function deleteLegalPage(id: string) {
  const dbResult = await tryPrismaLong(async () => {
    await prisma.legalPage.delete({ where: { id } });
    return true;
  });
  if (dbResult) return true;
  if (process.env.DATABASE_URL && dbResult === null) throw new Error("DB_UNAVAILABLE");

  const index = mockStore.legalPages.findIndex((row) => row.id === id);
  if (index === -1) return false;
  mockStore.legalPages.splice(index, 1);
  return true;
}

/** Ensure the three core pages exist (draft) so admin can edit them immediately. */
export async function ensureCoreLegalPages() {
  for (const slug of CORE_LEGAL_SLUGS) {
    const existing = await getLegalPageBySlug(slug);
    if (existing) continue;
    try {
      await createLegalPage({
        title: defaultTitleForSlug(slug),
        slug,
        content: defaultHtmlForSlug(slug),
        ...defaultSeoForSlug(slug),
        status: "published",
      });
    } catch {
      /* race / already exists */
    }
  }
  return listLegalPages();
}
