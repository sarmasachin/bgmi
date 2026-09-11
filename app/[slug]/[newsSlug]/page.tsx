import { isNewsCategorySlug, newsArticlePath } from "@/src/lib/newsCategories";
import { listNewsCategorySlugs } from "@/src/server/repositories/newsCategoryRepository";
import { getPublishedNewsBySlug } from "@/src/server/repositories/newsRepository";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type Props = {
  /** First segment must share the name `slug` with `app/[slug]` (Next.js rule). */
  params: Promise<{ slug: string; newsSlug: string }>;
};

/** Old `/{category}/{slug}` → `/{slug}`. */
async function redirectLegacyCategoryNewsUrl(category: string, newsSlug: string): Promise<never> {
  const known = await listNewsCategorySlugs();
  if (!isNewsCategorySlug(category, known)) notFound();
  const item = await getPublishedNewsBySlug(newsSlug);
  if (!item) notFound();
  permanentRedirect(newsArticlePath(item.primaryCategory, item.slug));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: category, newsSlug } = await params;
  await redirectLegacyCategoryNewsUrl(category, newsSlug);
  return { robots: { index: false, follow: false } };
}

export default async function CategoryNewsArticlePage({ params }: Props) {
  const { slug: category, newsSlug } = await params;
  await redirectLegacyCategoryNewsUrl(category, newsSlug);
}
