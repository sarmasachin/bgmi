import type { Metadata } from "next";
import { HomeTitleDummyAd } from "@/src/components/HomeTitleDummyAd";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { PUBG_MOBILE_LITE_PATH } from "@/src/lib/pubgMobileLite";
import { getFfPageCards } from "@/src/server/repositories/homeCardsRepository";

const fallbackTitle =
  "PUBG Mobile Flash Sensitivity Calculator | Camera ADS Gyro for Low-End Phones";
const fallbackDescription =
  "Free PUBG Mobile Flash sensitivity calculator for 2GB–4GB phones. Get Camera, ADS, and Gyroscope settings tuned for 30–60 FPS entry devices.";
const canonical = toCanonicalUrl(PUBG_MOBILE_LITE_PATH);

export async function generateMetadata(): Promise<Metadata> {
  const cards = await getFfPageCards("pubg-mobile-lite");
  const title = cards.hero.title.trim() || fallbackTitle;
  const description = cards.seo.description.trim() || fallbackDescription;
  const keywords = cards.seo.keywords.length
    ? cards.seo.keywords
    : [
        "PUBG Mobile Flash sensitivity calculator",
        "PUBG Mobile Flash sensitivity settings",
        "PUBG Flash 2GB RAM sensitivity",
        "PUBG Mobile Flash gyroscope",
        "PUBG Mobile Flash ADS sensitivity",
      ];
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical },
    ...buildSocialMetadata({ title, description, url: canonical }),
  };
}

export default async function PubgMobileLitePage() {
  const cards = await getFfPageCards("pubg-mobile-lite");
  const title = cards.hero.title.trim() || fallbackTitle;
  return (
    <>
      <h1 className="main-title">{title}</h1>
      <HomeTitleDummyAd />
    </>
  );
}
