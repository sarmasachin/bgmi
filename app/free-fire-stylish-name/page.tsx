import type { Metadata } from "next";
import { FreeFireStylishNameLandingPage } from "@/src/components/FreeFireStylishNameLandingPage";
import { FREE_FIRE_STYLISH_NAME_PATH } from "@/src/lib/freeFireStylishNamePage";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getFreeFireStylishNamePage } from "@/src/server/repositories/freeFireStylishNameRepository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getFreeFireStylishNamePage();
  const canonical = toCanonicalUrl(page.path || FREE_FIRE_STYLISH_NAME_PATH);

  return {
    title: page.seoTitle,
    description: page.seoDescription,
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
      title: page.seoTitle,
      description: page.seoDescription,
      url: canonical,
      image: "/icon.png?v=3",
      imageAlt: page.seoTitle,
    }),
  };
}

export default function FreeFireStylishNamePage() {
  return <FreeFireStylishNameLandingPage />;
}
