import { NewsSection } from "@/src/features/news/NewsSection";
import { AdSlot } from "@/src/components/AdSlot";
import { HomeHeader } from "@/src/components/HomeHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import type { Metadata } from "next";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { getNewsListingSeo } from "@/src/server/repositories/listingSeoRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";

export const dynamic = "force-dynamic";

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
  const [settings, seo] = await Promise.all([getSettings(), getNewsListingSeo()]);

  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      <main className="page-container news-listing-page">
        <h1 className="main-title">{seo.title}</h1>
        <AdSlot slotKey="news_list_top" />
        <NewsSection page={page} />
        <AdSlot slotKey="news_list_bottom" />
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
