import { PubgApkLandingPage } from "@/src/components/PubgApkLandingPage";
import { PUBG_APK_PATH } from "@/src/lib/pubgApkPage";
import { getPubgApkPage } from "@/src/server/repositories/pubgApkPageRepository";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPubgApkPage();
    const canonical = toCanonicalUrl(page.path || PUBG_APK_PATH);

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
        imageAlt: page.heroImageAlt || "Sensitivity Settings — PUBG Mobile APK guide",
      }),
    };
  } catch {
    const canonical = toCanonicalUrl(PUBG_APK_PATH);
    return {
      title: "PUBG Mobile APK",
      description: "PUBG Mobile APK and Play Store guide.",
      alternates: { canonical },
    };
  }
}

export default function PubgApkPage() {
  return <PubgApkLandingPage />;
}
