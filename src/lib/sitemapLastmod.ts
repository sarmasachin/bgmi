export function normalizeSitemapPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed || trimmed === "/") return "/";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/, "") || "/";
}

/** Page Cards variant → public URL path. */
export function pageCardsVariantToSitemapPath(variant: string): string | null {
  switch (variant) {
    case "freefire":
      return "/";
    case "freefire-max":
      return "/free-fire-max-sensitivity-settings-calculator";
    case "bgmi":
      return "/bgmi";
    case "pubg":
      return "/pubg";
    case "pubg-mobile-codes":
      return "/pubg-mobile-codes";
    default:
      return null;
  }
}

/** Game article / FAQ game → public URL path. */
export function gameContentToSitemapPath(game: string): string | null {
  return pageCardsVariantToSitemapPath(game);
}

export function legalSlugToSitemapPath(slug: string): string | null {
  const cleaned = slug.trim().replace(/^\/+|\/+$/g, "").toLowerCase();
  if (cleaned === "privacy" || cleaned === "terms" || cleaned === "disclaimer") {
    return `/${cleaned}`;
  }
  if (!cleaned) return null;
  return `/legal/${cleaned}`;
}

/**
 * SiteSetting keys that represent real content for each static sitemap path.
 * Fallback lastmod = newest updatedAt among these (not a fake fixed date).
 */
export const SITEMAP_PATH_CONTENT_KEYS: Record<string, string[]> = {
  "/": [
    "settings:homeCards:freefire",
    "settings:gameArticle:freefire",
    "settings:gameFaq:freefire",
    "settings:seo",
  ],
  "/bgmi": [
    "settings:homeCards:bgmi",
    "settings:gameArticle:bgmi",
    "settings:homeFaq",
  ],
  "/pubg": [
    "settings:homeCards:pubg",
    "settings:gameArticle:pubg",
    "settings:gameFaq:pubg",
  ],
  "/pubg-mobile-codes": [
    "settings:homeCards:pubg-mobile-codes",
    "settings:gameArticle:pubg-mobile-codes",
  ],
  "/free-fire-max-sensitivity-settings-calculator": [
    "settings:homeCards:freefire-max",
    "settings:gameArticle:freefire-max",
    "settings:gameFaq:freefire-max",
  ],
  "/free-fire-advance-server": ["settings:advanceServerPage"],
  "/news": ["settings:newsListingSeo"],
  "/contact": ["settings:contactSeo"],
};

export const SITEMAP_STATIC_PATHS = [
  "/",
  "/bgmi",
  "/pubg",
  "/pubg-mobile-codes",
  "/free-fire-max-sensitivity-settings-calculator",
  "/free-fire-advance-server",
  "/news",
  "/privacy",
  "/terms",
  "/contact",
  "/disclaimer",
] as const;
