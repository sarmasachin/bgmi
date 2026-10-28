import type { Metadata } from "next";
import { FreeFireStylishNameLandingPage } from "@/src/components/FreeFireStylishNameLandingPage";
import { FREE_FIRE_INDIA_STYLISH_NAME_PATH } from "@/src/lib/freeFireIndiaNamePage";
import { FREE_FIRE_INDIA_PATH } from "@/src/lib/gamePagePath";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getFreeFireIndiaStylishNamePage } from "@/src/server/repositories/freeFireIndiaStylishNameRepository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getFreeFireIndiaStylishNamePage();
    const canonical = toCanonicalUrl(FREE_FIRE_INDIA_STYLISH_NAME_PATH);
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
  } catch {
    const canonical = toCanonicalUrl(FREE_FIRE_INDIA_STYLISH_NAME_PATH);
    return {
      title: "Free Fire India Stylish Name",
      description: "Free Fire India stylish name generator.",
      alternates: { canonical },
    };
  }
}

export default function FreeFireIndiaStylishNamePage() {
  return (
    <FreeFireStylishNameLandingPage
      variant="free-fire-india"
      path={FREE_FIRE_INDIA_STYLISH_NAME_PATH}
      parentLabel="Free Fire India"
      parentHref={FREE_FIRE_INDIA_PATH}
    />
  );
}
