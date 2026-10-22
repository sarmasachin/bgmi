import type { Metadata } from "next";
import { HomeTitleDummyAd } from "@/src/components/HomeTitleDummyAd";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { getFfPageCards } from "@/src/server/repositories/homeCardsRepository";

const fallbackTitle =
  "BGMI Air Sensitivity Calculator | Camera ADS Gyro for Low-End Phones";
const fallbackDescription =
  "Free BGMI Air sensitivity calculator for 2GB–4GB phones. Get Camera, ADS, and Gyroscope settings tuned for 30–60 FPS entry devices.";
const canonical = toCanonicalUrl("/bgmi-air");

export async function generateMetadata(): Promise<Metadata> {
  const cards = await getFfPageCards("bgmi-lite");
  const title = cards.hero.title.trim() || fallbackTitle;
  const description = cards.seo.description.trim() || fallbackDescription;
  const keywords = cards.seo.keywords.length
    ? cards.seo.keywords
    : [
        "BGMI Air sensitivity calculator",
        "BGMI Air sensitivity settings",
        "BGMI Air 2GB RAM sensitivity",
        "BGMI Air gyroscope",
        "BGMI Air ADS sensitivity",
        "BGMI Air camera sensitivity",
      ];
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical },
    ...buildSocialMetadata({ title, description, url: canonical }),
  };
}

export default async function BgmiLitePage() {
  const cards = await getFfPageCards("bgmi-lite");
  const title = cards.hero.title.trim() || fallbackTitle;
  return (
    <>
      <h1 className="main-title">{title}</h1>
      <HomeTitleDummyAd />
    </>
  );
}
