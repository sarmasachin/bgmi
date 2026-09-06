import type { Metadata } from "next";
import { PubgRedeemCodeLandingPage } from "@/src/components/PubgRedeemCodeLandingPage";
import { PUBG_REDEEM_CODE_PATH } from "@/src/lib/pubgRedeemCodes";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getPubgRedeemPage } from "@/src/server/repositories/pubgRedeemCodesRepository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPubgRedeemPage();
    const canonical = toCanonicalUrl(page.path || PUBG_REDEEM_CODE_PATH);
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
  } catch {
    const canonical = toCanonicalUrl(PUBG_REDEEM_CODE_PATH);
    return {
      title: "PUBG Mobile Redeem Codes",
      description:
        "Latest PUBG Mobile redeem codes. Fan-made tracker — redeem only in the official client.",
      alternates: { canonical },
    };
  }
}

export default function PubgRedeemCodePage() {
  return <PubgRedeemCodeLandingPage />;
}
