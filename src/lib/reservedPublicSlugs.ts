/** First URL segment already used by a real website route. Do not reuse for CMS/category. */

export const RESERVED_PUBLIC_SLUGS = new Set([
  "admin",
  "api",
  "contact",
  "news",
  "bgmi",
  "bgmi-apk",
  "bgmi-redeem-code",
  "bgmi-lite",
  "bgmi-lite-apk",
  "bgmi-lite-redeem-code",
  "bgmi-lite-stylish-name",
  "pubg",
  "pubg-apk",
  "pubg-redeem-code",
  "pubg-mobile-codes",
  "pubg-mobile-lite",
  "pubg-mobile-lite-apk",
  "pubg-mobile-lite-redeem-code",
  "pubg-mobile-lite-name",
  "free-fire-redeem-code",
  "free-fire-stylish-name",
  "free-fire-max-redeem-code",
  "free-fire-max-stylish-name",
  "privacy",
  "terms",
  "disclaimer",
  "legal",
  "sitemap",
  "robots",
  "manifest",
  "favicon",
  "free-fire-sensitivity-settings-calculator",
  "free-fire-max-sensitivity-settings-calculator",
  "free-fire-advance-server",
]);

export function firstPublicSlugSegment(slug: string): string {
  return slug.trim().replace(/^\/+|\/+$/g, "").toLowerCase().split("/")[0] ?? "";
}

export function isReservedPublicSlug(slug: string): boolean {
  const top = firstPublicSlugSegment(slug);
  return Boolean(top) && RESERVED_PUBLIC_SLUGS.has(top);
}
