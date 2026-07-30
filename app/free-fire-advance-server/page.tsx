import { FfAdvanceServerLandingPage } from "@/src/components/FfAdvanceServerLandingPage";
import { FREE_FIRE_ADVANCE_SERVER_PATH } from "@/src/lib/ffAdvanceServerPage";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { getAdvanceServerPage } from "@/src/server/repositories/advanceServerPageRepository";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getAdvanceServerPage();
  const canonical = toCanonicalUrl(page.path || FREE_FIRE_ADVANCE_SERVER_PATH);

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
      imageAlt: "Sensitivity Settings — Advance Server guide",
    }),
  };
}

export default function FreeFireAdvanceServerPage() {
  return <FfAdvanceServerLandingPage />;
}
