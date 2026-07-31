/** Public news category hubs + primary URL segment (Sportskeeda-style). */

export const NEWS_CATEGORIES = [
  { slug: "ff-max", label: "FF Max" },
  { slug: "free-fire", label: "Free Fire" },
] as const;

export type NewsCategorySlug = (typeof NEWS_CATEGORIES)[number]["slug"];

export const DEFAULT_NEWS_CATEGORY: NewsCategorySlug = "ff-max";

const CATEGORY_SET = new Set<string>(NEWS_CATEGORIES.map((c) => c.slug));

export function isNewsCategorySlug(value: string): value is NewsCategorySlug {
  return CATEGORY_SET.has(value);
}

export function normalizeNewsCategory(value?: string | null): NewsCategorySlug | null {
  const trimmed = (value ?? "").trim().toLowerCase();
  if (!trimmed) return null;
  return isNewsCategorySlug(trimmed) ? trimmed : null;
}

export function coerceNewsCategory(value?: string | null): NewsCategorySlug {
  return normalizeNewsCategory(value) ?? DEFAULT_NEWS_CATEGORY;
}

export function newsCategoryLabel(slug: string): string {
  const found = NEWS_CATEGORIES.find((c) => c.slug === slug);
  return found?.label ?? slug;
}

/** One article = one public path from primary category. */
export function newsArticlePath(primaryCategory: string | null | undefined, slug: string): string {
  const cat = coerceNewsCategory(primaryCategory);
  const safeSlug = slug.trim().replace(/^\/+|\/+$/g, "");
  return safeSlug ? `/${cat}/${safeSlug}` : `/${cat}`;
}

export function normalizeExtraCategories(
  primary: NewsCategorySlug,
  extras?: string[] | null,
): NewsCategorySlug[] {
  const seen = new Set<NewsCategorySlug>();
  for (const raw of extras ?? []) {
    const cat = normalizeNewsCategory(raw);
    if (!cat || cat === primary || seen.has(cat)) continue;
    seen.add(cat);
  }
  return [...seen];
}

/** Map Home Clone game → default news primary category. */
export function newsCategoryFromCloneGame(game?: string | null): NewsCategorySlug {
  if (game === "freefire") return "free-fire";
  if (game === "freefire-max") return "ff-max";
  return DEFAULT_NEWS_CATEGORY;
}

export function newsCategoryListingTitle(slug: NewsCategorySlug): string {
  if (slug === "ff-max") return "Free Fire Max News";
  return "Free Fire News";
}

export function newsCategoryListingDescription(slug: NewsCategorySlug): string {
  if (slug === "ff-max") {
    return "Latest Free Fire Max news, redeem codes, updates, and guides.";
  }
  return "Latest Free Fire news, redeem codes, updates, and guides.";
}
