import type { Metadata } from "next";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { PUBG_MOBILE_LITE_PATH } from "@/src/lib/pubgMobileLite";
import { getFfPageCards } from "@/src/server/repositories/homeCardsRepository";

const fallbackTitle =
  "PUBG Mobile Lite Sensitivity Calculator | Camera ADS Gyro for Low-End Phones";
const fallbackDescription =
  "Free PUBG Mobile Lite sensitivity calculator for 2GB–4GB phones. Get Camera, ADS, and Gyroscope settings tuned for 30–60 FPS entry devices.";
const canonical = toCanonicalUrl(PUBG_MOBILE_LITE_PATH);

export async function generateMetadata(): Promise<Metadata> {
  const cards = await getFfPageCards("pubg-mobile-lite");
  const title = cards.hero.title.trim() || fallbackTitle;
  const description = cards.seo.description.trim() || fallbackDescription;
  const keywords = cards.seo.keywords.length
    ? cards.seo.keywords
    : [
        "PUBG Mobile Lite sensitivity calculator",
        "PUBG Mobile Lite sensitivity settings",
        "PUBG Lite 2GB RAM sensitivity",
        "PUBG Mobile Lite gyroscope",
        "PUBG Mobile Lite ADS sensitivity",
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
  return <h1 className="main-title">{title}</h1>;
}
