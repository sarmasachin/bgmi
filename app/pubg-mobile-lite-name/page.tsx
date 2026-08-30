import type { Metadata } from "next";
import { PubgMobileLiteNameLandingPage } from "@/src/components/PubgMobileLiteNameLandingPage";
import { PUBG_MOBILE_LITE_NAME_PATH } from "@/src/lib/pubgMobileLiteNamePage";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getPubgMobileLiteNamePage } from "@/src/server/repositories/pubgMobileLiteNameRepository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPubgMobileLiteNamePage();
  const canonical = toCanonicalUrl(page.path || PUBG_MOBILE_LITE_NAME_PATH);

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
      imageAlt: page.title || "PUBG Mobile Lite stylish name generator",
    }),
  };
}

export default function PubgMobileLiteNamePage() {
  return <PubgMobileLiteNameLandingPage />;
}
