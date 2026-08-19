import { AdSlot } from "@/src/components/AdSlot";
import { ClientErrorBoundary } from "@/src/components/ClientErrorBoundary";
import { HomeHeader } from "@/src/components/HomeHeader";
import { NewsCommentSection } from "@/src/components/NewsCommentSection";
import { SiteFooter } from "@/src/components/SiteFooter";
import { extractNewsMeta, resolveNewsSeoDescription } from "@/src/lib/newsContent";
import { coerceNewsCategory, newsCategoryLabel } from "@/src/lib/newsCategories";
import { getAdPlacementVisibility } from "@/src/server/repositories/adPlacementRepository";
import { listApprovedCommentsByNewsId } from "@/src/server/repositories/commentsRepository";
import { listNewsCategories } from "@/src/server/repositories/newsCategoryRepository";
import { resolveNewsCanonicalUrl } from "@/src/server/repositories/newsRepository";
import { getSettings } from "@/src/server/repositories/settingsRepository";
import { getSiteUrl, toCanonicalUrl } from "@/src/lib/siteUrl";
import { breadcrumbListSchema, newsArticleSchema } from "@/src/lib/schema";
import { buildSocialMetadata, DEFAULT_OG_IMAGE_PATH } from "@/src/lib/socialMeta";
import { formatNewsPublishedAtIst, latestNewsDateValue } from "@/src/lib/formatNewsPublishedAt";
import type { Metadata } from "next";
import Link from "next/link";

type NewsDetailItem = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: unknown;
  featureImage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  primaryCategory?: string | null;
  publishedAt?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export function buildNewsDetailMetadata(item: NewsDetailItem): Metadata {
  const primary = coerceNewsCategory(item.primaryCategory);
  const meta = extractNewsMeta(item.content);
  const articleUrl = resolveNewsCanonicalUrl(item.slug, meta.canonicalUrl, primary);
  const pageTitle = item.seoTitle?.trim() || item.title;
  const description = resolveNewsSeoDescription({
    seoDescription: item.seoDescription,
    excerpt: item.excerpt,
    title: item.title,
  });
  const socialTitle = meta.socialTitle?.trim() || pageTitle;
  const socialDescription = meta.socialDescription?.trim() || description;
  const imageAlt = meta.socialImageAlt?.trim() || item.title;
  const image = meta.ogImageUrl?.trim() || item.featureImage;
  const keywords = (meta.keywords ?? "")
    .split(",")
    .map((part) => part.trim())
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

export async function NewsDetailView({ item }: { item: NewsDetailItem }) {
  const meta = extractNewsMeta(item.content);
  const imageAlt = meta.socialImageAlt?.trim() || item.title;

  const [adPlaces, settings, comments, categories] = await Promise.all([
    getAdPlacementVisibility(),
    getSettings(),
    listApprovedCommentsByNewsId(item.id),
    listNewsCategories(),
  ]);

  const knownSlugs = categories.map((c) => c.slug);
  const primary = coerceNewsCategory(item.primaryCategory, knownSlugs);
  const categoryHref = `/${primary}`;
  const categoryLabel = newsCategoryLabel(primary, categories);

  const baseUrl = getSiteUrl();
  const articleUrl = resolveNewsCanonicalUrl(item.slug, meta.canonicalUrl, primary);
  const crumbTitle =
    item.title.length > 48 ? `${item.title.slice(0, 45).trimEnd()}…` : item.title;
  const breadcrumbLd = breadcrumbListSchema([
    { name: "Home", url: toCanonicalUrl("/") },
    { name: "News", url: toCanonicalUrl("/news") },
    { name: categoryLabel, url: toCanonicalUrl(categoryHref) },
    { name: item.title, url: articleUrl },
  ]);
  const articleSchema = newsArticleSchema({
    baseUrl,
    headline: item.seoTitle?.trim() || item.title,
    description: resolveNewsSeoDescription({
      seoDescription: item.seoDescription,
      excerpt: item.excerpt,
      title: item.title,
    }),
    datePublished: item.publishedAt ?? item.createdAt,
    dateModified: item.updatedAt,
    image: meta.ogImageUrl?.trim() || item.featureImage || `${baseUrl}${DEFAULT_OG_IMAGE_PATH}`,
    mainEntityOfPage: articleUrl,
  });

  return (
    <div>
      <HomeHeader siteTitle={settings.homeDisplay.headerTitle} navigation={settings.navigation} />
      <main className="page-container news-detail-page">
        <article className="news-detail-card">
          <nav className="news-detail-breadcrumb" aria-label="Breadcrumb">
            <ol className="news-detail-breadcrumb-list">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/news">News</Link>
              </li>
              <li>
                <Link href={categoryHref}>{categoryLabel}</Link>
              </li>
              <li aria-current="page">{crumbTitle}</li>
            </ol>
          </nav>
          <h1>{item.title}</h1>
          <p className="news-detail-published">
            {formatNewsPublishedAtIst(latestNewsDateValue(item))}
          </p>
          {adPlaces.newsArticle.news_detail_top ? <AdSlot slotKey="news_detail_top" /> : null}
          {item.featureImage ? (
            <img
              className="news-detail-hero"
              src={item.featureImage}
              alt={imageAlt}
              loading="eager"
            />
          ) : null}
          {item.excerpt?.trim() ? (
            <p className="news-detail-lead">{item.excerpt.trim()}</p>
          ) : null}
          {item.content && typeof item.content === "object" && "html" in item.content ? (
            <div
              className="news-detail-body"
              dangerouslySetInnerHTML={{ __html: String(item.content.html ?? "") }}
            />
          ) : null}
          {adPlaces.newsArticle.news_detail_mid ? <AdSlot slotKey="news_detail_mid" /> : null}
          {adPlaces.newsArticle.news_detail_bottom ? <AdSlot slotKey="news_detail_bottom" /> : null}
        </article>
        <ClientErrorBoundary label="Comments">
          <NewsCommentSection newsId={item.id} initialComments={comments} />
        </ClientErrorBoundary>
        {breadcrumbLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
          />
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      </main>
      <SiteFooter settings={settings} />
    </div>
  );
}
