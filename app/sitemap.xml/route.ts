import { getSiteUrl } from "@/src/lib/siteUrl";
import {
  buildNewsSitemapEntries,
  buildPageSitemapEntries,
} from "@/src/server/sitemap/buildSitemap";
import {
  newestLastmod,
  sitemapIndexToXml,
  xmlResponse,
} from "@/src/server/sitemap/sitemapXml";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const baseUrl = getSiteUrl();
  try {
    const [pages, news] = await Promise.all([
      buildPageSitemapEntries(),
      buildNewsSitemapEntries(),
    ]);
    return xmlResponse(
      sitemapIndexToXml([
        {
          loc: `${baseUrl}/sitemap-pages.xml`,
          lastmod: newestLastmod(pages),
        },
        {
          loc: `${baseUrl}/sitemap-news.xml`,
          lastmod: newestLastmod(news),
        },
      ]),
    );
  } catch (error) {
    console.error("[sitemap] failed to build index", error);
    return xmlResponse(
      sitemapIndexToXml([{ loc: `${baseUrl}/sitemap-pages.xml` }]),
    );
  }
}
