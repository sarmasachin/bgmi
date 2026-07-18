import { AdSlot } from "@/src/components/AdSlot";
import { RatingWidget } from "@/src/components/RatingWidget";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { ratingWidgetRemountKey } from "@/src/lib/ratingWidgetKey";
import { getAdPlacementVisibility } from "@/src/server/repositories/adPlacementRepository";
import { getPublishedNewsBySlug } from "@/src/server/repositories/newsRepository";
import { getRatingSummary } from "@/src/server/repositories/ratingSummaryRepository";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublishedNewsBySlug(slug);
  if (!item) {
    return {
      title: "News Not Found",
      description: "This news article is not available.",
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const articleUrl = `${baseUrl}/news/${item.slug}`;
  const description = item.excerpt?.trim() || "Latest BGMI and gaming updates.";

  return {
    title: item.title,
    description,
    alternates: { canonical: `/news/${item.slug}` },
    openGraph: {
      title: item.title,
      description,
      url: articleUrl,
      type: "article",
      siteName: "Sensitivity Settings",
      images: item.featureImage ? [{ url: item.featureImage, alt: item.title }] : undefined,
      publishedTime: item.publishedAt ? new Date(item.publishedAt).toISOString() : undefined,
      modifiedTime: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
      images: item.featureImage ? [item.featureImage] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getPublishedNewsBySlug(slug);
  if (!item) notFound();

  const [adPlaces, ratingSummary] = await Promise.all([
    getAdPlacementVisibility(),
    getRatingSummary("news", item.id),
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    datePublished: item.publishedAt ?? item.createdAt,
    dateModified: item.updatedAt,
    author: { "@type": "Person", name: "Admin" },
    publisher: { "@type": "Organization", name: "Sensitivity Settings" },
    image: item.featureImage || `${baseUrl}/og-default.png`,
  };

  return (
    <main className="page-container news-detail-page">
      <article className="news-detail-card">
        <h1>{item.title}</h1>
        {adPlaces.newsArticle.news_detail_top ? <AdSlot slotKey="news_detail_top" /> : null}
        {item.featureImage ? (
          <img
            className="news-detail-hero"
            src={item.featureImage}
            alt={item.title}
            loading="eager"
          />
        ) : null}
        <p>{item.excerpt ?? ""}</p>
        {item.content && typeof item.content === "object" && "html" in item.content ? (
          <div dangerouslySetInnerHTML={{ __html: String(item.content.html ?? "") }} />
        ) : null}
        {adPlaces.newsArticle.news_detail_mid ? <AdSlot slotKey="news_detail_mid" /> : null}
        {adPlaces.newsArticle.news_detail_bottom ? <AdSlot slotKey="news_detail_bottom" /> : null}
        <ClientErrorBoundary label="Rating">
          <RatingWidget
            key={ratingWidgetRemountKey("news", item.id)}
            title="Rate this news article"
            targetType="news"
            targetId={item.id}
            initialSummary={ratingSummary}
          />
        </ClientErrorBoundary>
      </article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
    </main>
  );
}
