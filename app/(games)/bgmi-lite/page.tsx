import type { Metadata } from "next";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { getFfPageCards } from "@/src/server/repositories/homeCardsRepository";

const fallbackTitle =
  "BGMI Lite Sensitivity Calculator | Camera ADS Gyro for Low-End Phones";
const fallbackDescription =
  "Free BGMI Lite sensitivity calculator for 2GB–4GB phones. Get Camera, ADS, and Gyroscope settings tuned for 30–60 FPS entry devices.";
const canonical = toCanonicalUrl("/bgmi-lite");

export async function generateMetadata(): Promise<Metadata> {
  const cards = await getFfPageCards("bgmi-lite");
  const title = cards.hero.title.trim() || fallbackTitle;
  const description = cards.seo.description.trim() || fallbackDescription;
  const keywords = cards.seo.keywords.length
    ? cards.seo.keywords
    : [
        "BGMI Lite sensitivity calculator",
        "BGMI Lite sensitivity settings",
        "BGMI Lite 2GB RAM sensitivity",
        "BGMI Lite gyroscope",
        "BGMI Lite ADS sensitivity",
        "BGMI Lite camera sensitivity",
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
  return <h1 className="main-title">{title}</h1>;
}
