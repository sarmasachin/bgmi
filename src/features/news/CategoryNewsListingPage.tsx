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
import { getSettings } from "@/src/server/repositories/settingsRepository";

type Props = {
  category: NewsCategorySlug;
  page?: number;
};

function resolvePage(raw?: number) {
  return Math.max(Number(raw ?? 1) || 1, 1);
}

export function buildCategoryNewsMetadata(
  category: NewsCategorySlug,
  page = 1,
): Metadata {
  const titleBase = newsCategoryListingTitle(category);
  const description = newsCategoryListingDescription(category);
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
  const settings = await getSettings();
  const title = newsCategoryListingTitle(category);

  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      <main className="page-container" style={{ paddingBottom: 40 }}>
        <h1 className="main-title">{title}</h1>
        <AdSlot slotKey="news_list_top" />
        <NewsSection page={currentPage} category={category} heading="Latest News" />
        <AdSlot slotKey="news_list_bottom" />
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
