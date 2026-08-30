import type { Metadata } from "next";
import { FreeFireRedeemCodeLandingPage } from "@/src/components/FreeFireRedeemCodeLandingPage";
import {
  FREE_FIRE_MAX_REDEEM_CODE_PATH,
} from "@/src/lib/freeFireMaxPages";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getFreeFireMaxRedeemPage } from "@/src/server/repositories/freeFireMaxRedeemCodesRepository";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getFreeFireMaxRedeemPage();
  const canonical = toCanonicalUrl(page.path || FREE_FIRE_MAX_REDEEM_CODE_PATH);
  const title = page.seoTitle;
  const description = page.seoDescription;
  const image = page.ui.socialImage || "/icon.png?v=3";

  return {
    title,
    description,
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
      title,
      description,
      url: canonical,
      image,
      imageAlt: page.ui.socialImageAlt || title,
    }),
  };
}

export default function FreeFireMaxRedeemCodePage() {
  return (
    <FreeFireRedeemCodeLandingPage
      variant="free-fire-max"
      path={FREE_FIRE_MAX_REDEEM_CODE_PATH}
      parentLabel="FF Max"
      parentHref={FREE_FIRE_MAX_PATH}
    />
  );
}
