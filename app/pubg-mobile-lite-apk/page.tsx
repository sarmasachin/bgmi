import { PubgMobileLiteApkLandingPage } from "@/src/components/PubgMobileLiteApkLandingPage";
import {
  DEFAULT_PUBG_MOBILE_LITE_APK_PAGE,
} from "@/src/lib/pubgMobileLiteApkPage";
import { PUBG_MOBILE_LITE_APK_PATH } from "@/src/lib/pubgMobileLite";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = DEFAULT_PUBG_MOBILE_LITE_APK_PAGE;
  const canonical = toCanonicalUrl(page.path || PUBG_MOBILE_LITE_APK_PATH);

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
      image: page.heroImage || "/icon.png?v=3",
      imageAlt: page.heroImageAlt || "Sensitivity Settings — PUBG Lite APK guide",
    }),
  };
}

export default function PubgMobileLiteApkPage() {
  return <PubgMobileLiteApkLandingPage />;
}
