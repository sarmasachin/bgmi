import { AdSlot } from "@/src/components/AdSlot";
import { RatingWidget } from "@/src/components/RatingWidget";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { ratingWidgetRemountKey } from "@/src/lib/ratingWidgetKey";
import { getAdPlacementVisibility } from "@/src/server/repositories/adPlacementRepository";
import { getPublishedNewsBySlug } from "@/src/server/repositories/newsRepository";
import { getRatingSummary } from "@/src/server/repositories/ratingSummaryRepository";
import { getSiteUrl, toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata, DEFAULT_OG_IMAGE_PATH } from "@/src/lib/socialMeta";
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

  const articleUrl = toCanonicalUrl(`/news/${item.slug}`);
  const description = item.excerpt?.trim() || "Latest BGMI and gaming updates.";
  const social = buildSocialMetadata({
    title: item.title,
    description,
    url: articleUrl,
    image: item.featureImage,
    imageAlt: item.title,
    type: "article",
  });
  const og = social.openGraph ?? {};

  return {
    title: item.title,
    description,
    alternates: { canonical: articleUrl },
    twitter: social.twitter,
    openGraph: {
      ...og,
      type: "article",
      publishedTime: item.publishedAt ? new Date(item.publishedAt).toISOString() : undefined,
      modifiedTime: item.updatedAt ? new Date(item.updatedAt).toISOString() : undefined,
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

  const baseUrl = getSiteUrl();
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    datePublished: item.publishedAt ?? item.createdAt,
    dateModified: item.updatedAt,
    author: { "@type": "Person", name: "Admin" },
    publisher: { "@type": "Organization", name: "Sensitivity Settings" },
    image: item.featureImage || `${baseUrl}${DEFAULT_OG_IMAGE_PATH}`,
    mainEntityOfPage: toCanonicalUrl(`/news/${item.slug}`),
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
