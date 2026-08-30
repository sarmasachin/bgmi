import { newsArticlePath } from "@/src/lib/newsCategories";
import { getSiteUrl, toCanonicalUrl } from "@/src/lib/siteUrl";
import { legalSlugToSitemapPath, pickLatestDate, toSitemapLastmodIst } from "@/src/lib/sitemapLastmod";
import { listPublishedLegalForSitemap } from "@/src/server/repositories/legalPagesRepository";
import { listNewsCategorySlugs } from "@/src/server/repositories/newsCategoryRepository";
import { listPublishedNewsForSitemap } from "@/src/server/repositories/newsRepository";
import { listPublishedPagesForSitemap } from "@/src/server/repositories/pagesRepository";
import {
  getSitemapLastmodMap,
  resolveSitemapLastmod,
} from "@/src/server/repositories/sitemapLastmodRepository";
import type { SitemapUrlEntry } from "@/src/server/sitemap/sitemapXml";

/** Redirects / admin / API — never list these (Google: canonical 200 URLs only). */
const RESERVED_TOP_SEGMENTS = new Set([
  "bgmi",
  "bgmi-lite",
  "bgmi-lite-apk",
  "bgmi-lite-redeem-code",
  "bgmi-lite-stylish-name",
  "pubg",
  "pubg-mobile-lite",
  "pubg-mobile-lite-apk",
  "pubg-mobile-lite-redeem-code",
  "pubg-mobile-lite-name",
  "free-fire-redeem-code",
  "free-fire-stylish-name",
  "free-fire-max-redeem-code",
  "free-fire-max-stylish-name",
  "news",
  "admin",
  "api",
  "privacy",
  "terms",
  "contact",
  "disclaimer",
  "legal",
  "pubg-mobile-codes",
  "free-fire-sensitivity-settings-calculator",
  "free-fire-max-sensitivity-settings-calculator",
  "free-fire-advance-server",
]);

function toPathFromCmsSlug(slug: string, reserved: Set<string>): string | null {
  const cleaned = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!cleaned) return null;
  const top = cleaned.split("/")[0]?.toLowerCase() ?? "";
  if (reserved.has(top)) return null;
  return `/${cleaned}`;
}

function row(baseUrl: string, path: string, lastmod: string | undefined): SitemapUrlEntry {
  return {
    loc: `${baseUrl}${path}`,
    ...(lastmod ? { lastmod } : {}),
  };
}

function absoluteImage(raw?: string | null): string | undefined {
  const trimmed = (raw ?? "").trim();
  if (!trimmed || trimmed.startsWith("data:")) return undefined;
  const abs = toCanonicalUrl(trimmed);
  return abs.startsWith("http://") || abs.startsWith("https://") ? abs : undefined;
}

export async function buildPageSitemapEntries(): Promise<SitemapUrlEntry[]> {
  const baseUrl = getSiteUrl();
  const lastmodMap = await getSitemapLastmodMap();
  const lastmod = (path: string) => toSitemapLastmodIst(resolveSitemapLastmod(lastmodMap, path));
  const categorySlugs = await listNewsCategorySlugs();
  const reserved = new Set([...RESERVED_TOP_SEGMENTS, ...categorySlugs]);

  const staticEntries: SitemapUrlEntry[] = [
    row(baseUrl, "/", lastmod("/")),
    row(baseUrl, "/bgmi", lastmod("/bgmi")),
    row(baseUrl, "/bgmi-lite", lastmod("/bgmi-lite")),
    row(baseUrl, "/bgmi-lite-apk", lastmod("/bgmi-lite-apk")),
    row(baseUrl, "/bgmi-lite-redeem-code", lastmod("/bgmi-lite-redeem-code")),
    row(baseUrl, "/bgmi-lite-stylish-name", lastmod("/bgmi-lite-stylish-name")),
    row(baseUrl, "/pubg-mobile-lite", lastmod("/pubg-mobile-lite")),
    row(baseUrl, "/pubg-mobile-lite-apk", lastmod("/pubg-mobile-lite-apk")),
    row(baseUrl, "/pubg-mobile-lite-redeem-code", lastmod("/pubg-mobile-lite-redeem-code")),
    row(baseUrl, "/pubg-mobile-lite-name", lastmod("/pubg-mobile-lite-name")),
    row(baseUrl, "/free-fire-redeem-code", lastmod("/free-fire-redeem-code")),
    row(baseUrl, "/free-fire-stylish-name", lastmod("/free-fire-stylish-name")),
    row(baseUrl, "/free-fire-max-redeem-code", lastmod("/free-fire-max-redeem-code")),
    row(baseUrl, "/free-fire-max-stylish-name", lastmod("/free-fire-max-stylish-name")),
    row(baseUrl, "/pubg", lastmod("/pubg")),
    row(baseUrl, "/pubg-mobile-codes", lastmod("/pubg-mobile-codes")),
    row(baseUrl, "/free-fire-max-sensitivity-settings-calculator", lastmod("/free-fire-max-sensitivity-settings-calculator")),
    row(baseUrl, "/free-fire-advance-server", lastmod("/free-fire-advance-server")),
    row(baseUrl, "/privacy", lastmod("/privacy")),
    row(baseUrl, "/terms", lastmod("/terms")),
    row(baseUrl, "/contact", lastmod("/contact")),
    row(baseUrl, "/disclaimer", lastmod("/disclaimer")),
  ];

  const seen = new Set(staticEntries.map((e) => e.loc));
  const [legalRows, pageRows] = await Promise.all([
    listPublishedLegalForSitemap(),
    listPublishedPagesForSitemap(),
  ]);

  const extraLegal: SitemapUrlEntry[] = [];
  for (const item of legalRows) {
    const path = legalSlugToSitemapPath(item.slug);
    if (!path || path === "/privacy" || path === "/terms" || path === "/disclaimer") continue;
    const loc = `${baseUrl}${path}`;
    if (seen.has(loc)) continue;
    seen.add(loc);
    extraLegal.push(row(baseUrl, path, toSitemapLastmodIst(item.updatedAt)));
  }

  const pageEntries: SitemapUrlEntry[] = [];
  for (const item of pageRows) {
    const path = toPathFromCmsSlug(item.slug, reserved);
    if (!path) continue;
    const loc = `${baseUrl}${path}`;
    if (seen.has(loc)) continue;
    seen.add(loc);
    pageEntries.push(row(baseUrl, path, toSitemapLastmodIst(item.updatedAt)));
  }

  return [...staticEntries, ...extraLegal, ...pageEntries];
}

export async function buildNewsSitemapEntries(): Promise<SitemapUrlEntry[]> {
  const baseUrl = getSiteUrl();
  const lastmodMap = await getSitemapLastmodMap();
  const categorySlugs = await listNewsCategorySlugs();
  const newsRows = await listPublishedNewsForSitemap();
  const listingLastmod = toSitemapLastmodIst(
    pickLatestDate(
      resolveSitemapLastmod(lastmodMap, "/news"),
      ...newsRows.map((item) => item.updatedAt),
    ),
  );

  const seen = new Set<string>();
  const categoryStamp = new Map<string, Date>();
  const articles: SitemapUrlEntry[] = [];

  for (const item of newsRows) {
    const stamp = item.updatedAt ? new Date(item.updatedAt) : undefined;
    if (stamp && !Number.isNaN(stamp.getTime())) {
      const cats = new Set<string>([item.primaryCategory, ...(item.extraCategories ?? [])]);
      for (const cat of cats) {
        const key = (cat || "").trim().toLowerCase();
        if (!key) continue;
        const prev = categoryStamp.get(key);
        if (!prev || stamp.getTime() > prev.getTime()) categoryStamp.set(key, stamp);
      }
    }

    const slug = (item.slug || "").trim().replace(/^\/+|\/+$/g, "");
    if (!slug) continue;
    const path = newsArticlePath(item.primaryCategory, slug);
    const loc = `${baseUrl}${path}`;
    if (seen.has(loc)) continue;
    seen.add(loc);
    const image = absoluteImage(item.featureImage);
    const articleLastmod = toSitemapLastmodIst(item.updatedAt);
    articles.push({
      loc,
      ...(articleLastmod ? { lastmod: articleLastmod } : {}),
      ...(image ? { images: [image] } : {}),
    });
  }

  const hubs: SitemapUrlEntry[] = [row(baseUrl, "/news", listingLastmod)];
  seen.add(`${baseUrl}/news`);

  for (const cat of categorySlugs) {
    const loc = `${baseUrl}/${cat}`;
    if (seen.has(loc)) continue;
    seen.add(loc);
    hubs.push(row(baseUrl, `/${cat}`, toSitemapLastmodIst(categoryStamp.get(cat))));
  }

  return [...hubs, ...articles];
}
