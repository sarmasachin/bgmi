import { FfAdvanceServerLandingPage } from "@/src/components/FfAdvanceServerLandingPage";
import { FF_ADVANCE_SERVER_PAGE } from "@/src/lib/ffAdvanceServerPage";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const page = FF_ADVANCE_SERVER_PAGE;
  const canonical = toCanonicalUrl(page.path);

  return {
    title: page.seoTitle,
    description: page.seoDescription,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    alternates: { canonical },
    ...buildSocialMetadata({
      title: page.seoTitle,
      description: page.seoDescription,
      url: canonical,
      image: page.heroImage,
      imageAlt: "Free Fire Advance Server official banner",
    }),
  };
}

export default function FreeFireAdvanceServerPage() {
  return <FfAdvanceServerLandingPage />;
}
