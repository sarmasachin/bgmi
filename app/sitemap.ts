import { MetadataRoute } from "next";
import { getSiteUrl } from "@/src/lib/siteUrl";
import { listPublishedNewsForSitemap } from "@/src/server/repositories/newsRepository";
import { listPublishedPagesForSitemap } from "@/src/server/repositories/pagesRepository";

/** Refresh sitemap periodically so new news/pages appear without a full redeploy. */
export const revalidate = 3600;

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
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/bgmi`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/pubg`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/pubg-mobile-codes`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/free-fire-max-sensitivity-settings-calculator`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: now,
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
      lastModified: item.updatedAt ?? item.publishedAt ?? now,
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
      lastModified: item.updatedAt ?? now,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return [...staticEntries, ...newsEntries, ...pageEntries];
}
