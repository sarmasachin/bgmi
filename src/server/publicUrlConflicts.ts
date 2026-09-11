import { prisma, tryPrismaLong } from "@/src/server/dbSafe";
import { mockStore } from "@/src/server/mockStore";
import {
  categoryListingOccupiesTopSlug,
  normalizeCategorySlugInput,
} from "@/src/lib/newsCategories";
import {
  firstPublicSlugSegment,
  isReservedPublicSlug,
} from "@/src/lib/reservedPublicSlugs";

export type PublicUrlConflictCode =
  | "SLUG_EXISTS"
  | "URL_TAKEN_SITE"
  | "URL_TAKEN_PAGE"
  | "URL_TAKEN_CATEGORY"
  | "URL_TAKEN_NEWS";

function pageSlugVariants(slug: string) {
  const normalized = slug.trim().replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase();
  if (!normalized) return slug.trim() ? [slug.trim()] : [];
  return Array.from(new Set([normalized, `/${normalized}`]));
}

function normalizeNewsPublicSlug(slug: string) {
  return slug.trim().replace(/^\/+|\/+$/g, "").toLowerCase();
}

async function categoryRowBySlug(slug: string, excludeId?: string) {
  return prisma.newsCategory.findFirst({
    where: excludeId ? { slug, id: { not: excludeId } } : { slug },
    select: { id: true, slug: true },
  });
}

async function pageRowBySlug(slug: string, excludeId?: string) {
  const variants = pageSlugVariants(slug);
  if (!variants.length) return null;
  return prisma.pageTemplate.findFirst({
    where: excludeId
      ? { slug: { in: variants }, id: { not: excludeId } }
      : { slug: { in: variants } },
    select: { id: true, slug: true },
  });
}

async function newsRowBySlug(slug: string, excludeId?: string) {
  const normalized = normalizeNewsPublicSlug(slug);
  if (!normalized) return null;
  return prisma.newsPost.findFirst({
    where: excludeId
      ? { slug: { equals: normalized, mode: "insensitive" }, id: { not: excludeId } }
      : { slug: { equals: normalized, mode: "insensitive" } },
    select: { id: true, slug: true },
  });
}

function mockPageTaken(slug: string, excludeId?: string) {
  const variants = pageSlugVariants(slug);
  return mockStore.pages.some(
    (item) => variants.includes(item.slug) && item.id !== excludeId,
  );
}

function mockNewsTaken(slug: string, excludeId?: string) {
  const normalized = normalizeNewsPublicSlug(slug);
  if (!normalized) return false;
  return mockStore.news.some(
    (item) => item.slug.trim().toLowerCase() === normalized && item.id !== excludeId,
  );
}

export async function findCategoryPublicSlugConflict(
  rawSlug: string,
  excludeCategoryId?: string,
): Promise<PublicUrlConflictCode | null> {
  const slug = normalizeCategorySlugInput(rawSlug);
  if (!slug) return "SLUG_EXISTS";

  const otherCat = await categoryRowBySlug(slug, excludeCategoryId);
  if (otherCat) return "SLUG_EXISTS";

  if (!categoryListingOccupiesTopSlug(slug)) return null;

  if (isReservedPublicSlug(slug)) return "URL_TAKEN_SITE";
  if (await pageRowBySlug(slug)) return "URL_TAKEN_PAGE";
  if (await newsRowBySlug(slug)) return "URL_TAKEN_NEWS";
  return null;
}

export async function findPagePublicSlugConflict(
  rawSlug: string,
  excludePageId?: string,
): Promise<PublicUrlConflictCode | null> {
  const top = firstPublicSlugSegment(rawSlug);
  if (!top) return "SLUG_EXISTS";

  if (isReservedPublicSlug(top)) return "URL_TAKEN_SITE";

  const cleaned = rawSlug.trim().replace(/^\/+|\/+$/g, "");
  const isSingleSegment = Boolean(cleaned) && !cleaned.includes("/");
  const cat = await prisma.newsCategory.findUnique({
    where: { slug: top },
    select: { slug: true },
  });
  if (cat && isSingleSegment) {
    return "URL_TAKEN_CATEGORY";
  }

  if (isSingleSegment && (await newsRowBySlug(top))) return "URL_TAKEN_NEWS";
  if (await pageRowBySlug(rawSlug, excludePageId)) return "SLUG_EXISTS";
  return null;
}

/** News articles live at `/{slug}`. Reject site/page/category collisions. */
export async function findNewsPublicSlugConflict(
  rawSlug: string,
  excludeNewsId?: string,
): Promise<PublicUrlConflictCode | null> {
  const slug = normalizeNewsPublicSlug(rawSlug);
  if (!slug || slug.includes("/")) return "SLUG_EXISTS";

  if (isReservedPublicSlug(slug)) return "URL_TAKEN_SITE";

  const cat = await prisma.newsCategory.findUnique({
    where: { slug },
    select: { slug: true },
  });
  if (cat) return "URL_TAKEN_CATEGORY";

  if (await pageRowBySlug(slug)) return "URL_TAKEN_PAGE";
  if (await newsRowBySlug(slug, excludeNewsId)) return "SLUG_EXISTS";
  return null;
}

export async function isPagePublicSlugTaken(slug: string, excludePageId?: string) {
  const db = await tryPrismaLong(async () => {
    const code = await findPagePublicSlugConflict(slug, excludePageId);
    return Boolean(code);
  });
  if (db !== null) return db;
  const top = firstPublicSlugSegment(slug);
  if (isReservedPublicSlug(top)) return true;
  if (mockNewsTaken(top)) return true;
  return mockPageTaken(slug, excludePageId);
}

export async function isCategoryPublicSlugTaken(slug: string, excludeCategoryId?: string) {
  const db = await tryPrismaLong(async () => {
    const code = await findCategoryPublicSlugConflict(slug, excludeCategoryId);
    return Boolean(code);
  });
  if (db !== null) return db;
  const normalized = normalizeCategorySlugInput(slug);
  if (!normalized) return false;
  if (isReservedPublicSlug(normalized)) return true;
  return mockPageTaken(normalized) || mockNewsTaken(normalized);
}

export async function isNewsPublicSlugTaken(slug: string, excludeNewsId?: string) {
  const db = await tryPrismaLong(async () => {
    const code = await findNewsPublicSlugConflict(slug, excludeNewsId);
    return Boolean(code);
  });
  if (db !== null) return db;
  const normalized = normalizeNewsPublicSlug(slug);
  if (!normalized || normalized.includes("/")) return true;
  if (isReservedPublicSlug(normalized)) return true;
  return mockPageTaken(normalized) || mockNewsTaken(normalized, excludeNewsId);
}
