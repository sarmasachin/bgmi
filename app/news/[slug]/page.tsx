import { AdSlot } from "@/src/components/AdSlot";
import { RatingWidget } from "@/src/components/RatingWidget";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { HomeHeader } from "@/src/components/HomeHeader";
import { NewsCommentSection } from "@/src/components/NewsCommentSection";
import { SiteFooter } from "@/src/components/SiteFooter";
import { ratingWidgetRemountKey } from "@/src/lib/ratingWidgetKey";
import { getAdPlacementVisibility } from "@/src/server/repositories/adPlacementRepository";
import { listApprovedCommentsByNewsId } from "@/src/server/repositories/commentsRepository";
import {
  extractNewsMeta,
  getPublishedNewsBySlug,
  resolveNewsCanonicalUrl,
} from "@/src/server/repositories/newsRepository";
import { getRatingSummary } from "@/src/server/repositories/ratingSummaryRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";
import { getSiteUrl } from "@/src/lib/siteUrl";
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

  const meta = extractNewsMeta(item.content);
  const articleUrl = resolveNewsCanonicalUrl(item.slug, meta.canonicalUrl);
  const pageTitle = item.seoTitle?.trim() || item.title;
  const description =
    item.seoDescription?.trim() || item.excerpt?.trim() || "Latest BGMI and gaming updates.";
  const socialTitle = meta.socialTitle?.trim() || pageTitle;
  const socialDescription = meta.socialDescription?.trim() || description;
  const imageAlt = meta.socialImageAlt?.trim() || item.title;
  const image = meta.ogImageUrl?.trim() || item.featureImage;
  const keywords = (meta.keywords ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const social = buildSocialMetadata({
    title: socialTitle,
    description: socialDescription,
    url: articleUrl,
    image,
    imageAlt,
    type: "article",
  });
  const og = social.openGraph ?? {};

  return {
    title: pageTitle,
    description,
    ...(keywords.length ? { keywords } : {}),
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

  const meta = extractNewsMeta(item.content);
  const imageAlt = meta.socialImageAlt?.trim() || item.title;

  const [adPlaces, ratingSummary, settings, comments] = await Promise.all([
    getAdPlacementVisibility(),
    getRatingSummary("news", item.id),
    getSettings(),
    listApprovedCommentsByNewsId(item.id),
  ]);

  const baseUrl = getSiteUrl();
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.seoTitle?.trim() || item.title,
    description: item.seoDescription?.trim() || item.excerpt?.trim() || undefined,
    datePublished: item.publishedAt ?? item.createdAt,
    dateModified: item.updatedAt,
    author: { "@type": "Person", name: "Admin" },
    publisher: { "@type": "Organization", name: "Sensitivity Settings" },
    image: meta.ogImageUrl?.trim() || item.featureImage || `${baseUrl}${DEFAULT_OG_IMAGE_PATH}`,
    mainEntityOfPage: resolveNewsCanonicalUrl(item.slug, meta.canonicalUrl),
  };

  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      <main className="page-container news-detail-page">
        <article className="news-detail-card">
          <h1>{item.title}</h1>
          {adPlaces.newsArticle.news_detail_top ? <AdSlot slotKey="news_detail_top" /> : null}
          {item.featureImage ? (
            <img
              className="news-detail-hero"
              src={item.featureImage}
              alt={imageAlt}
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
        <ClientErrorBoundary label="Comments">
          <NewsCommentSection newsId={item.id} initialComments={comments} />
        </ClientErrorBoundary>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
