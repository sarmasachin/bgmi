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
    case "bgmi-lite":
      return "/bgmi-lite";
    case "pubg-mobile-lite":
      return "/pubg-mobile-lite";
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
 * Fallback lastmod = newest `updatedAt` among that URL's own content keys.
 * Sitemap generate never stamps Date.now().
 */
export const SITEMAP_PATH_CONTENT_KEYS: Record<string, string[]> = {
  "/": [
    "settings:homeCards:freefire",
    "settings:gameArticle:freefire",
    "settings:gameFaq:freefire",
    "settings:seo",
    "settings:homeDisplay",
    "settings:ffTrustBar",
  ],
  "/bgmi": [
    "settings:homeCards:bgmi",
    "settings:gameArticle:bgmi",
    "settings:homeFaq",
  ],
  "/bgmi-lite": [
    "settings:homeCards:bgmi-lite",
    "settings:gameFaq:bgmi-lite",
    "settings:gameArticle:bgmi-lite",
  ],
  "/pubg-mobile-lite": [
    "settings:homeCards:pubg-mobile-lite",
    "settings:gameFaq:pubg-mobile-lite",
    "settings:gameArticle:pubg-mobile-lite",
  ],
  "/pubg-mobile-lite-apk": [],
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
  "/bgmi-lite-redeem-code": ["settings:bgmiLiteRedeemCodes"],
  "/bgmi-lite-stylish-name": ["settings:bgmiLiteStylishName"],
  "/bgmi-lite-apk": [],
  "/pubg-mobile-lite-redeem-code": ["settings:pubgMobileLiteRedeemCodes"],
  "/pubg-mobile-lite-name": ["settings:pubgMobileLiteName"],
  "/free-fire-redeem-code": ["settings:freeFireRedeemCodes"],
  "/free-fire-stylish-name": ["settings:freeFireStylishName"],
  "/free-fire-max-redeem-code": ["settings:freeFireMaxRedeemCodes"],
  "/free-fire-max-stylish-name": ["settings:freeFireMaxStylishName"],
  "/news": ["settings:newsListingSeo"],
  "/contact": ["settings:contactSeo"],
};

export const SITEMAP_STATIC_PATHS = [
  "/",
  "/bgmi",
  "/bgmi-lite",
  "/bgmi-lite-apk",
  "/bgmi-lite-redeem-code",
  "/bgmi-lite-stylish-name",
  "/pubg",
  "/pubg-mobile-lite",
  "/pubg-mobile-lite-apk",
  "/pubg-mobile-lite-redeem-code",
  "/pubg-mobile-lite-name",
  "/free-fire-redeem-code",
  "/free-fire-stylish-name",
  "/free-fire-max-redeem-code",
  "/free-fire-max-stylish-name",
  "/pubg-mobile-codes",
  "/free-fire-max-sensitivity-settings-calculator",
  "/free-fire-advance-server",
  "/news",
  "/privacy",
  "/terms",
  "/contact",
  "/disclaimer",
] as const;

/** Sitemap lastmod in IST so Google/GSC date matches India (not UTC yesterday). */
export function toSitemapLastmodIst(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  let hour = get("hour");
  if (hour === "24") hour = "00";
  const year = get("year");
  const month = get("month");
  const day = get("day");
  if (!year || !month || !day) return undefined;
  return `${year}-${month}-${day}T${hour}:${get("minute")}:${get("second")}+05:30`;
}

export function toIstDateOnly(value: Date | string | null | undefined): string | undefined {
  const full = toSitemapLastmodIst(value);
  return full ? full.slice(0, 10) : undefined;
}

export function pickLatestDate(
  ...values: Array<Date | string | null | undefined>
): Date | undefined {
  let best: Date | undefined;
  for (const value of values) {
    if (!value) continue;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) continue;
    if (!best || date.getTime() > best.getTime()) best = date;
  }
  return best;
}
