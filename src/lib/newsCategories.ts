/** Public news category hubs + primary URL segment (Sportskeeda-style). */

export type NewsCategoryDef = { slug: string; label: string };

/** Seeded when DB is empty; also offline fallback. */
export const DEFAULT_NEWS_CATEGORIES: readonly NewsCategoryDef[] = [
  { slug: "ff-max", label: "FF Max" },
  { slug: "free-fire", label: "Free Fire" },
] as const;

/** @deprecated Prefer DB-loaded list; alias of defaults for offline UI. */
export const NEWS_CATEGORIES = DEFAULT_NEWS_CATEGORIES;

/** @deprecated Use string slugs from DB; kept as alias for call sites. */
export type NewsCategorySlug = string;

export const DEFAULT_NEWS_CATEGORY = "ff-max";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidCategorySlugFormat(value: string): boolean {
  return SLUG_RE.test(value);
}

export function normalizeCategorySlugInput(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** True when slug is in the known list (DB or defaults). */
export function isNewsCategorySlug(
  value: string,
  knownSlugs?: readonly string[],
): boolean {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed || !isValidCategorySlugFormat(trimmed)) return false;
  if (knownSlugs && knownSlugs.length) return knownSlugs.includes(trimmed);
  return DEFAULT_NEWS_CATEGORIES.some((c) => c.slug === trimmed);
}

export function normalizeNewsCategory(
  value?: string | null,
  knownSlugs?: readonly string[],
): string | null {
  const trimmed = (value ?? "").trim().toLowerCase();
  if (!trimmed) return null;
  return isNewsCategorySlug(trimmed, knownSlugs) ? trimmed : null;
}

export function coerceNewsCategory(
  value?: string | null,
  knownSlugs?: readonly string[],
): string {
  return normalizeNewsCategory(value, knownSlugs) ?? DEFAULT_NEWS_CATEGORY;
}

export function newsCategoryLabel(
  slug: string,
  categories?: readonly NewsCategoryDef[],
): string {
  const list = categories?.length ? categories : DEFAULT_NEWS_CATEGORIES;
  const found = list.find((c) => c.slug === slug);
  return found?.label ?? slug;
}

/** One article = one public path from primary category. */
export function newsArticlePath(primaryCategory: string | null | undefined, slug: string): string {
  const cat = coerceNewsCategory(primaryCategory);
  const safeSlug = slug.trim().replace(/^\/+|\/+$/g, "");
  return safeSlug ? `/${cat}/${safeSlug}` : `/${cat}`;
}

export function normalizeExtraCategories(
  primary: string,
  extras?: string[] | null,
  knownSlugs?: readonly string[],
): string[] {
  const primaryNorm = coerceNewsCategory(primary, knownSlugs);
  const seen = new Set<string>();
  for (const raw of extras ?? []) {
    const cat = normalizeNewsCategory(raw, knownSlugs);
    if (!cat || cat === primaryNorm || seen.has(cat)) continue;
    seen.add(cat);
  }
  return [...seen];
}

/** Map Home Clone game → default news primary category. */
export function newsCategoryFromCloneGame(game?: string | null): string {
  if (game === "freefire") return "free-fire";
  if (game === "freefire-max") return "ff-max";
  return DEFAULT_NEWS_CATEGORY;
}

export function newsCategoryListingTitle(
  slug: string,
  categories?: readonly NewsCategoryDef[],
): string {
  const label = newsCategoryLabel(slug, categories);
  if (slug === "ff-max") return "Free Fire Max News";
  if (slug === "free-fire") return "Free Fire News";
  return `${label} News`;
}

export function newsCategoryListingDescription(
  slug: string,
  categories?: readonly NewsCategoryDef[],
): string {
  const label = newsCategoryLabel(slug, categories);
  if (slug === "ff-max") {
    return "Latest Free Fire Max news, redeem codes, updates, and guides.";
  }
  if (slug === "free-fire") {
    return "Latest Free Fire news, redeem codes, updates, and guides.";
  }
  return `Latest ${label} news, updates, and guides.`;
}
