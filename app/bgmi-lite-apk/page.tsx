import { BgmiLiteBetaApkLandingPage } from "@/src/components/BgmiLiteBetaApkLandingPage";
import { BGMI_LITE_APK_PATH } from "@/src/lib/bgmiLiteBetaApkPage";
import { getBgmiLiteApkPage } from "@/src/server/repositories/bgmiLiteApkPageRepository";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getBgmiLiteApkPage();
  const canonical = toCanonicalUrl(page.path || BGMI_LITE_APK_PATH);

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
      imageAlt: page.heroImageAlt || "Sensitivity Settings — BGMI Lite APK guide",
    }),
  };
}

export default function BgmiLiteApkPage() {
  return <BgmiLiteBetaApkLandingPage />;
}
