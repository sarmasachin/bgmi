import { NewsSection } from "@/src/features/news/NewsSection";
import { AdSlot } from "@/src/components/AdSlot";
import type { Metadata } from "next";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";

const title = "BGMI & Gaming News";
const description =
  "Latest BGMI and PUBG Mobile news, updates, and gaming stories from Sensitivity Settings.";
const newsCanonical = toCanonicalUrl("/news");

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: newsCanonical },
  ...buildSocialMetadata({ title, description, url: newsCanonical }),
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function NewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(Number(params.page ?? "1") || 1, 1);

  return (
    <main className="page-container" style={{ paddingBottom: 40 }}>
      <h1 className="main-title">BGMI &amp; Gaming News</h1>
      <AdSlot slotKey="news_list_top" />
      <NewsSection page={page} />
      <AdSlot slotKey="news_list_bottom" />
    </main>
  );
}
