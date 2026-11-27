import { NewsSection } from "@/src/features/news/NewsSection";
import { AdSlot } from "@/src/components/AdSlot";
import { HomeHeader } from "@/src/components/HomeHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { clampNewsListPage, newsListPagePath, parseNewsListPage } from "@/src/lib/newsListPage";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import {
  coerceNewsCategory,
  newsArticlePath,
  newsCategoryLabel,
  newsCategoryListingDescription,
  newsCategoryListingPath,
  newsCategoryListingTitle,
  menuGameForNewsCategory,
  type NewsCategorySlug,
} from "@/src/lib/newsCategories";
import { renameLiteNewsPost } from "@/src/lib/renameLiteDisplayNames";
import {
  breadcrumbListSchema,
  collectionPageSchema,
  webPageSchema,
} from "@/src/lib/schema";
import {
  getNewsCategoryBySlug,
  listNewsCategories,
} from "@/src/server/repositories/newsCategoryRepository";
import { listPublishedNewsByCategory } from "@/src/server/repositories/newsRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";

const NEWS_PAGE_SIZE = 15;

type Props = {
  category: NewsCategorySlug;
  page?: number;
};

export async function buildCategoryNewsMetadata(
  category: NewsCategorySlug,
  page = 1,
): Promise<Metadata> {
  const requested = parseNewsListPage(page);
  const listed = await listPublishedNewsByCategory(category, requested, NEWS_PAGE_SIZE);
  const safePage = clampNewsListPage(requested, listed.total, NEWS_PAGE_SIZE);
  const [categories, catRow] = await Promise.all([
    listNewsCategories(),
    getNewsCategoryBySlug(category),
  ]);
  const titleBase = newsCategoryListingTitle(category, categories, catRow?.seoTitle);
  const description = newsCategoryListingDescription(
    category,
    categories,
    catRow?.seoDescription,
  );
  const title = safePage > 1 ? `${titleBase} — Page ${safePage}` : titleBase;
  const desc = safePage > 1 ? `Page ${safePage} of ${description}` : description;
  const path = newsListPagePath(newsCategoryListingPath(category), safePage);
  const canonical = toCanonicalUrl(path);
  const keywords = (catRow?.seoKeywords ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  return {
    title,
    description: desc,
    ...(keywords.length ? { keywords } : {}),
    alternates: { canonical },
    ...buildSocialMetadata({ title, description: desc, url: canonical }),
  };
}

export async function CategoryNewsListingPage({ category, page }: Props) {
  const requested = parseNewsListPage(page);
  const [settings, categories, catRow, listed] = await Promise.all([
    getSettings(),
    listNewsCategories(),
    getNewsCategoryBySlug(category),
    listPublishedNewsByCategory(category, requested, NEWS_PAGE_SIZE),
  ]);
  const currentPage = clampNewsListPage(requested, listed.total, NEWS_PAGE_SIZE);
  if (currentPage !== requested) {
    redirect(newsListPagePath(newsCategoryListingPath(category), currentPage));
  }
  const title = newsCategoryListingTitle(category, categories, catRow?.seoTitle);
  const description = newsCategoryListingDescription(
    category,
    categories,
    catRow?.seoDescription,
  );
  const listPath = newsListPagePath(newsCategoryListingPath(category), currentPage);
  const canonical = toCanonicalUrl(listPath);
  const homeUrl = toCanonicalUrl("/");
  const newsUrl = toCanonicalUrl("/news");
  const categoryLabel = newsCategoryLabel(category, categories);

  const listItems = (listed.data ?? []).map((raw) => {
    const item = renameLiteNewsPost(raw as Record<string, unknown>) as {
      title?: string;
      slug?: string;
      id?: string;
      primaryCategory?: string | null;
    };
    const primary = coerceNewsCategory(item.primaryCategory ?? category);
    const slug = item.slug ?? item.id ?? "";
    return {
      name: (item.title ?? "News").trim(),
      url: toCanonicalUrl(newsArticlePath(primary, slug)),
    };
  });

  const pageTitle = currentPage > 1 ? `${title} — Page ${currentPage}` : title;
  const breadcrumbLd = breadcrumbListSchema([
    { name: "Home", url: homeUrl },
    { name: "News", url: newsUrl },
    { name: categoryLabel, url: canonical },
  ]);
  const webPageLd = webPageSchema({
    name: pageTitle,
    description,
    url: canonical,
    inLanguage: "en",
    mainEntityId: `${canonical}#collection`,
  });
  const collectionLd = {
    ...collectionPageSchema({
      name: pageTitle,
      description,
      url: canonical,
      items: listItems,
    }),
    "@id": `${canonical}#collection`,
  };

  return (
    <div>
      <HomeHeader
        siteTitle={settings.homeDisplay.headerTitle}
        navigation={settings.navigation}
        menuGame={menuGameForNewsCategory(category) ?? undefined}
      />
      <main className="page-container news-listing-page">
        <h1 className="main-title">{title}</h1>
        <AdSlot slotKey="news_list_top" />
        <NewsSection
          page={currentPage}
          category={category}
          heading="Latest News"
          listBasePath={newsCategoryListingPath(category)}
        />
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
