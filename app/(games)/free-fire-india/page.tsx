import type { Metadata } from "next";
import { HomeTitleDummyAd } from "@/src/components/HomeTitleDummyAd";
import { FREE_FIRE_INDIA_PATH } from "@/src/lib/gamePagePath";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { getFfPageCards } from "@/src/server/repositories/homeCardsRepository";

const fallbackTitle = "Free Fire India Sensitivity Calculator";
const fallbackDescription =
  "Free Fire India sensitivity calculator for General, Red Dot, 2x, 4x, sniper scope, and free look. Get RAM and DPI based settings for your phone.";
const canonical = toCanonicalUrl(FREE_FIRE_INDIA_PATH);

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const cards = await getFfPageCards("freefire-india");
  const title = cards.hero.title.trim() || fallbackTitle;
  const description = cards.seo.description.trim() || fallbackDescription;
  const keywords = cards.seo.keywords.length
    ? cards.seo.keywords
    : [
        "Free Fire India sensitivity calculator",
        "Free Fire India sensitivity settings",
        "Free Fire India RAM sensitivity",
        "Free Fire India DPI settings",
        "Free Fire India Red Dot sensitivity",
        "Free Fire India sniper sensitivity",
      ];
  return {
    title: { absolute: title },
    description,
    keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    alternates: { canonical },
    ...buildSocialMetadata({
      title,
      description,
      url: canonical,
      image: "/og-home-freefire.png",
      imageAlt: "Free Fire India Sensitivity Calculator",
    }),
  };
}

export default async function FreeFireIndiaPage() {
  const cards = await getFfPageCards("freefire-india");
  const title = cards.hero.title.trim() || fallbackTitle;
  return (
    <>
      <h1 className="main-title ff-gradient-title">{title}</h1>
      <HomeTitleDummyAd />
    </>
  );
}
