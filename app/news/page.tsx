import { NewsSection } from "@/src/features/news/NewsSection";
import { AdSlot } from "@/src/components/AdSlot";
import { HomeHeader } from "@/src/components/HomeHeader";
import { SiteFooter } from "@/src/components/SiteFooter";
import type { Metadata } from "next";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { getSettings } from "@/src/server/repositories/settingsRepository";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

function resolveNewsPage(raw?: string) {
  return Math.max(Number(raw ?? "1") || 1, 1);
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const page = resolveNewsPage(params.page);
  const title = page > 1 ? `Gaming News — Page ${page}` : "Free Fire, BGMI & Gaming News";
  const description =
    page > 1
      ? `Page ${page} of latest Free Fire, BGMI, and PUBG Mobile news, updates, and gaming stories from Sensitivity Settings.`
      : "Latest Free Fire, BGMI, and PUBG Mobile news, updates, and gaming stories from Sensitivity Settings.";
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
  const settings = await getSettings();

  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      <main className="page-container" style={{ paddingBottom: 40 }}>
        <h1 className="main-title">Free Fire, BGMI &amp; Gaming News</h1>
        <AdSlot slotKey="news_list_top" />
        <NewsSection page={page} />
        <AdSlot slotKey="news_list_bottom" />
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
