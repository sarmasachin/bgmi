import { MetadataRoute } from "next";
import { getSiteUrl } from "@/src/lib/siteUrl";
import { listPublishedNewsForSitemap } from "@/src/server/repositories/newsRepository";
import { listPublishedPagesForSitemap } from "@/src/server/repositories/pagesRepository";
import {
  getSitemapLastmodMap,
  resolveSitemapLastmod,
} from "@/src/server/repositories/sitemapLastmodRepository";

/** Always rebuild from DB last-update timestamps (admin save → new lastmod). */
export const dynamic = "force-dynamic";
export const revalidate = 0;

/** App routes that already have dedicated pages — avoid duplicate CMS entries. */
const RESERVED_TOP_SEGMENTS = new Set([
  "bgmi",
  "pubg",
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

function toPathFromCmsSlug(slug: string): string | null {
  const cleaned = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!cleaned) return null;
  const top = cleaned.split("/")[0]?.toLowerCase() ?? "";
  if (RESERVED_TOP_SEGMENTS.has(top)) return null;
  return `/${cleaned}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const lastmodMap = await getSitemapLastmodMap();
  const lastmod = (path: string) => resolveSitemapLastmod(lastmodMap, path);

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: lastmod("/"),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/bgmi`,
      lastModified: lastmod("/bgmi"),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/pubg`,
      lastModified: lastmod("/pubg"),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/pubg-mobile-codes`,
      lastModified: lastmod("/pubg-mobile-codes"),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/free-fire-max-sensitivity-settings-calculator`,
      lastModified: lastmod("/free-fire-max-sensitivity-settings-calculator"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/free-fire-advance-server`,
      lastModified: lastmod("/free-fire-advance-server"),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: lastmod("/news"),
      changeFrequency: "hourly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: lastmod("/privacy"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: lastmod("/terms"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: lastmod("/contact"),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: lastmod("/disclaimer"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const [newsRows, pageRows] = await Promise.all([
    listPublishedNewsForSitemap(),
    listPublishedPagesForSitemap(),
  ]);

  const seen = new Set(staticEntries.map((e) => e.url));

  const newsEntries: MetadataRoute.Sitemap = [];
  for (const item of newsRows) {
    const slug = (item.slug || "").trim().replace(/^\/+|\/+$/g, "");
    if (!slug) continue;
    const url = `${baseUrl}/news/${slug}`;
    if (seen.has(url)) continue;
    seen.add(url);
    newsEntries.push({
      url,
      lastModified: item.updatedAt ?? item.publishedAt ?? lastmod("/news"),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  const pageEntries: MetadataRoute.Sitemap = [];
  for (const item of pageRows) {
    const path = toPathFromCmsSlug(item.slug);
    if (!path) continue;
    const url = `${baseUrl}${path}`;
    if (seen.has(url)) continue;
    seen.add(url);
    pageEntries.push({
      url,
      lastModified: item.updatedAt ?? lastmod(path),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return [...staticEntries, ...newsEntries, ...pageEntries];
}
