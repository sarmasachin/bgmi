import { coerceNewsCategory, newsArticlePath } from "@/src/lib/newsCategories";
import { getPublishedNewsBySlug } from "@/src/server/repositories/newsRepository";
import { notFound, permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

/** Legacy `/news/[slug]` → primary category URL (one article = one link). */
export default async function LegacyNewsSlugRedirect({ params }: Props) {
  const { slug } = await params;
  const item = await getPublishedNewsBySlug(slug);
  if (!item) notFound();
  const primary = coerceNewsCategory(
    (item as { primaryCategory?: string | null }).primaryCategory,
  );
  permanentRedirect(newsArticlePath(primary, item.slug));
}
