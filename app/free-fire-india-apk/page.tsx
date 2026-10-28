import { FreeFireIndiaApkLandingPage } from "@/src/components/FreeFireApkLandingPage";
import { toFreeFireIndiaApkPage } from "@/src/lib/freeFireIndiaApkPage";
import { FREE_FIRE_INDIA_APK_PATH } from "@/src/lib/gamePagePath";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getFreeFireApkPage } from "@/src/server/repositories/freeFireApkPageRepository";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = toFreeFireIndiaApkPage(await getFreeFireApkPage());
    const canonical = toCanonicalUrl(page.path || FREE_FIRE_INDIA_APK_PATH);

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
        imageAlt: page.heroImageAlt || "Sensitivity Settings — Free Fire India APK guide",
      }),
    };
  } catch {
    const canonical = toCanonicalUrl(FREE_FIRE_INDIA_APK_PATH);
    return {
      title: "Free Fire India APK",
      description: "Free Fire India APK and Play Store guide.",
      alternates: { canonical },
    };
  }
}

export default function FreeFireIndiaApkPage() {
  return <FreeFireIndiaApkLandingPage />;
}
