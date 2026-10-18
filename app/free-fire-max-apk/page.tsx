import { FreeFireMaxApkLandingPage } from "@/src/components/FreeFireMaxApkLandingPage";
import { FREE_FIRE_MAX_APK_PATH } from "@/src/lib/freeFireMaxApkPage";
import { getFreeFireMaxApkPage } from "@/src/server/repositories/freeFireMaxApkPageRepository";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getFreeFireMaxApkPage();
    const canonical = toCanonicalUrl(page.path || FREE_FIRE_MAX_APK_PATH);

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
        imageAlt: page.heroImageAlt || "Sensitivity Settings — Free Fire MAX APK guide",
      }),
    };
  } catch {
    const canonical = toCanonicalUrl(FREE_FIRE_MAX_APK_PATH);
    return {
      title: "Free Fire MAX APK",
      description: "Free Fire MAX APK and Play Store guide.",
      alternates: { canonical },
    };
  }
}

export default function FreeFireMaxApkPage() {
  return <FreeFireMaxApkLandingPage />;
}
