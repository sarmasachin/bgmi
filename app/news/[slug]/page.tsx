import {
  buildCategoryNewsMetadata,
  CategoryNewsListingPage,
} from "@/src/features/news/CategoryNewsListingPage";
import {
  coerceNewsCategory,
  isNewsCategorySlug,
  newsArticlePath,
} from "@/src/lib/newsCategories";
import { listNewsCategorySlugs } from "@/src/server/repositories/newsCategoryRepository";
import { getPublishedNewsBySlug } from "@/src/server/repositories/newsRepository";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

/**
 * `/news/[slug]`:
 * - known category → filtered category listing (used when `/{category}` is a calculator)
 * - else legacy article slug → redirect to `/{category}/{slug}`
 */
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const known = await listNewsCategorySlugs();
  if (isNewsCategorySlug(slug, known)) {
    const page = Math.max(Number((await searchParams).page ?? "1") || 1, 1);
    return buildCategoryNewsMetadata(slug, page);
  }
  return {};
}

export default async function NewsSlugOrCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const known = await listNewsCategorySlugs();
  if (isNewsCategorySlug(slug, known)) {
    const page = Math.max(Number((await searchParams).page ?? "1") || 1, 1);
    return <CategoryNewsListingPage category={slug} page={page} />;
  }

  const item = await getPublishedNewsBySlug(slug);
  if (!item) notFound();
  const primary = coerceNewsCategory(
    (item as { primaryCategory?: string | null }).primaryCategory,
  );
  permanentRedirect(newsArticlePath(primary, item.slug));
}
