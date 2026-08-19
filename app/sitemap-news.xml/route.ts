import { getSiteUrl } from "@/src/lib/siteUrl";
import { buildNewsSitemapEntries } from "@/src/server/sitemap/buildSitemap";
import { sitemapEntriesToXml, xmlResponse } from "@/src/server/sitemap/sitemapXml";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    return xmlResponse(sitemapEntriesToXml(await buildNewsSitemapEntries()));
  } catch (error) {
    console.error("[sitemap] news sitemap failed", error);
    return xmlResponse(
      sitemapEntriesToXml([{ loc: `${getSiteUrl()}/news` }]),
    );
  }
}
