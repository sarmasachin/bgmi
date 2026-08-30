import type { Metadata } from "next";
import { BgmiLiteStylishNameLandingPage } from "@/src/components/BgmiLiteStylishNameLandingPage";
import { BGMI_LITE_STYLISH_NAME_PATH } from "@/src/lib/bgmiLiteStylishNamePage";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getBgmiLiteStylishPage } from "@/src/server/repositories/bgmiLiteStylishNameRepository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getBgmiLiteStylishPage();
  const canonical = toCanonicalUrl(page.path || BGMI_LITE_STYLISH_NAME_PATH);

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
      imageAlt: page.title || "BGMI Lite stylish name generator",
    }),
  };
}

export default function BgmiLiteStylishNamePage() {
  return <BgmiLiteStylishNameLandingPage />;
}
