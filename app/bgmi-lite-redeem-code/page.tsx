import type { Metadata } from "next";
import { BgmiLiteRedeemCodeLandingPage } from "@/src/components/BgmiLiteRedeemCodeLandingPage";
import { BGMI_LITE_REDEEM_CODE_PATH } from "@/src/lib/bgmiLiteRedeemCodes";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getBgmiLiteRedeemPage } from "@/src/server/repositories/bgmiLiteRedeemCodesRepository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getBgmiLiteRedeemPage();
  const canonical = toCanonicalUrl(page.path || BGMI_LITE_REDEEM_CODE_PATH);
  const image = page.ui.socialImage || "/icon.png?v=3";
  const imageAlt = page.ui.socialImageAlt || page.seoTitle;

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
      image,
      imageAlt,
    }),
  };
}

export default function BgmiLiteRedeemCodePage() {
  return <BgmiLiteRedeemCodeLandingPage />;
}
