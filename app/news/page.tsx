import { NewsSection } from "@/src/features/news/NewsSection";
import Link from "next/link";
import { AdSlot } from "@/src/components/AdSlot";
import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Gaming News",
  description: "Latest BGMI and gaming updates with featured stories.",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "Gaming News",
    description: "Latest BGMI and gaming updates with featured stories.",
    url: `${baseUrl}/news`,
    siteName: "SENS MASTER PRO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gaming News",
    description: "Latest BGMI and gaming updates with featured stories.",
  },
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function NewsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(Number(params.page ?? "1"), 1);

  return (
    <main className="page-container" style={{ paddingBottom: 40 }}>
      <h1 className="main-title">Gaming News</h1>
      <AdSlot slotKey="news_list_top" />
      <NewsSection />
      <AdSlot slotKey="news_list_bottom" />
      <div className="news-pagination-row">
        <Link href={`/news?page=${Math.max(1, page - 1)}`}>Prev</Link>
        <span>Page {page}</span>
        <Link href={`/news?page=${page + 1}`}>Next</Link>
      </div>
    </main>
  );
}
