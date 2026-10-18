import { NewsSection } from "@/src/features/news/NewsSection";
import { AdSlot } from "@/src/components/AdSlot";
import { HomeHeader } from "@/src/components/HomeHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import type { Metadata } from "next";
import {
  coerceNewsCategory,
  newsArticlePath,
} from "@/src/lib/newsCategories";
import { renameLiteNewsPost } from "@/src/lib/renameLiteDisplayNames";
import {
  breadcrumbListSchema,
  collectionPageSchema,
  webPageSchema,
} from "@/src/lib/schema";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { getNewsListingSeo } from "@/src/server/repositories/listingSeoRepository";
import { listPublishedNews } from "@/src/server/repositories/newsRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";

export const dynamic = "force-dynamic";

const NEWS_PAGE_SIZE = 15;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

function resolveNewsPage(raw?: string) {
  return Math.max(Number(raw ?? "1") || 1, 1);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const page = resolveNewsPage(params.page);
  const seo = await getNewsListingSeo();
  const title = page > 1 ? `${seo.title} — Page ${page}` : seo.title;
  const description =
    page > 1 ? `Page ${page} of ${seo.description}` : seo.description;
  const canonical =
    page > 1 ? toCanonicalUrl(`/news?page=${page}`) : toCanonicalUrl("/news");

  return {
    title,
    description,
    alternates: { canonical },
    ...buildSocialMetadata({ title, description, url: canonical }),
  };
}

export default async function NewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = resolveNewsPage(params.page);
  const [settings, seo, listed] = await Promise.all([
    getSettings(),
    getNewsListingSeo(),
    listPublishedNews(page, NEWS_PAGE_SIZE),
  ]);

  const canonical =
    page > 1 ? toCanonicalUrl(`/news?page=${page}`) : toCanonicalUrl("/news");
  const homeUrl = toCanonicalUrl("/");

  const listItems = (listed.data ?? []).map((raw) => {
    const item = renameLiteNewsPost(raw as Record<string, unknown>) as {
      title?: string;
      slug?: string;
      id?: string;
      primaryCategory?: string | null;
    };
    const primary = coerceNewsCategory(item.primaryCategory);
    const slug = item.slug ?? item.id ?? "";
    return {
      name: (item.title ?? "News").trim(),
      url: toCanonicalUrl(newsArticlePath(primary, slug)),
    };
  });

  const breadcrumbLd = breadcrumbListSchema([
    { name: "Home", url: homeUrl },
    { name: page > 1 ? `News — Page ${page}` : "News", url: canonical },
  ]);
  const webPageLd = webPageSchema({
    name: page > 1 ? `${seo.title} — Page ${page}` : seo.title,
    description: seo.description,
    url: canonical,
    inLanguage: "en",
    mainEntityId: `${canonical}#collection`,
  });
  const collectionLd = {
    ...collectionPageSchema({
      name: page > 1 ? `${seo.title} — Page ${page}` : seo.title,
      description: seo.description,
      url: canonical,
      items: listItems,
    }),
    "@id": `${canonical}#collection`,
  };

  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      <main className="page-container news-listing-page">
        <h1 className="main-title">{seo.title}</h1>
        <AdSlot slotKey="news_list_top" />
        <NewsSection page={page} />
        <AdSlot slotKey="news_list_bottom" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }}
        />
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
