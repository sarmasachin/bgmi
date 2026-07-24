import { FfAdvanceServerLandingPage } from "@/src/components/FfAdvanceServerLandingPage";
import { FF_ADVANCE_SERVER_PAGE } from "@/src/lib/ffAdvanceServerPage";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = FF_ADVANCE_SERVER_PAGE;
  const canonical = toCanonicalUrl(page.path);
  const ogImage = toCanonicalUrl(page.heroImage);

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
      image: ogImage,
      imageAlt: page.heroImageAlt,
    }),
  };
}

export default function FreeFireAdvanceServerPage() {
  return <FfAdvanceServerLandingPage />;
}
