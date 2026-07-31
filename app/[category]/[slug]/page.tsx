import {
  buildNewsDetailMetadata,
  NewsDetailView,
} from "@/src/features/news/NewsDetailView";
import "@/src/features/news/newsDetail.css";
import {
  coerceNewsCategory,
  isNewsCategorySlug,
  newsArticlePath,
} from "@/src/lib/newsCategories";
import { getPublishedNewsBySlug } from "@/src/server/repositories/newsRepository";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  if (!isNewsCategorySlug(category)) {
    return {
      title: "News Not Found",
      robots: { index: false, follow: false },
    };
  }
  const item = await getPublishedNewsBySlug(slug);
  if (!item) {
    return {
      title: "News Not Found",
      description: "This news article is not available.",
      robots: { index: false, follow: false },
    };
  }
  const primary = coerceNewsCategory(
    (item as { primaryCategory?: string | null }).primaryCategory,
  );
  if (primary !== category) {
    return {
      title: item.title,
      robots: { index: false, follow: false },
    };
  }
  return buildNewsDetailMetadata(item);
}

export default async function CategoryNewsArticlePage({ params }: Props) {
  const { category, slug } = await params;
  if (!isNewsCategorySlug(category)) notFound();

  const item = await getPublishedNewsBySlug(slug);
  if (!item) notFound();

  const primary = coerceNewsCategory(
    (item as { primaryCategory?: string | null }).primaryCategory,
  );
  if (primary !== category) {
    permanentRedirect(newsArticlePath(primary, item.slug));
  }

  return <NewsDetailView item={item} />;
}
