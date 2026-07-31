import { NewsSection } from "@/src/features/news/NewsSection";
import { AdSlot } from "@/src/components/AdSlot";
import { HomeHeader } from "@/src/components/HomeHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import type { Metadata } from "next";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import {
  newsCategoryListingDescription,
  newsCategoryListingTitle,
  type NewsCategorySlug,
} from "@/src/lib/newsCategories";
import { listNewsCategories } from "@/src/server/repositories/newsCategoryRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";

type Props = {
  category: NewsCategorySlug;
  page?: number;
};

function resolvePage(raw?: number) {
  return Math.max(Number(raw ?? 1) || 1, 1);
}

export async function buildCategoryNewsMetadata(
  category: NewsCategorySlug,
  page = 1,
): Promise<Metadata> {
  const categories = await listNewsCategories();
  const titleBase = newsCategoryListingTitle(category, categories);
  const description = newsCategoryListingDescription(category, categories);
  const title = page > 1 ? `${titleBase} — Page ${page}` : titleBase;
  const desc = page > 1 ? `Page ${page} of ${description}` : description;
  const path = page > 1 ? `/${category}?page=${page}` : `/${category}`;
  const canonical = toCanonicalUrl(path);
  return {
    title,
    description: desc,
    alternates: { canonical },
    ...buildSocialMetadata({ title, description: desc, url: canonical }),
  };
}

export async function CategoryNewsListingPage({ category, page }: Props) {
  const currentPage = resolvePage(page);
  const [settings, categories] = await Promise.all([getSettings(), listNewsCategories()]);
  const title = newsCategoryListingTitle(category, categories);

  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      <main className="page-container news-listing-page">
        <h1 className="main-title">{title}</h1>
        <AdSlot slotKey="news_list_top" />
        <NewsSection page={currentPage} category={category} heading="Latest News" />
        <AdSlot slotKey="news_list_bottom" />
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
