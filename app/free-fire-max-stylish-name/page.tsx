import type { Metadata } from "next";
import { FreeFireStylishNameLandingPage } from "@/src/components/FreeFireStylishNameLandingPage";
import { FREE_FIRE_MAX_STYLISH_NAME_PATH } from "@/src/lib/freeFireMaxPages";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getFreeFireMaxStylishNamePage } from "@/src/server/repositories/freeFireMaxStylishNameRepository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getFreeFireMaxStylishNamePage();
  const canonical = toCanonicalUrl(page.path || FREE_FIRE_MAX_STYLISH_NAME_PATH);
  const title = page.seoTitle;
  const description = page.seoDescription;

  return {
    title,
    description,
    keywords: [...page.seoKeywords],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: { canonical },
    category: "games",
    ...buildSocialMetadata({
      title,
      description,
      url: canonical,
      image: "/icon.png?v=3",
      imageAlt: title,
    }),
  };
}

export default function FreeFireMaxStylishNamePage() {
  return (
    <FreeFireStylishNameLandingPage
      variant="free-fire-max"
      path={FREE_FIRE_MAX_STYLISH_NAME_PATH}
      parentLabel="FF Max"
      parentHref={FREE_FIRE_MAX_PATH}
    />
  );
}
