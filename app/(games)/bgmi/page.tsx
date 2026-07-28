import type { Metadata } from "next";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { getFfPageCards } from "@/src/server/repositories/homeCardsRepository";

const fallbackTitle = "BGMI Sensitivity Calculator | Free No Recoil Settings 2026";
const fallbackDescription =
  "Free BGMI sensitivity calculator for camera, ADS, and gyroscope. Generate custom no-recoil settings for your phone, FPS mode, and play style.";
const canonical = toCanonicalUrl("/bgmi");

export async function generateMetadata(): Promise<Metadata> {
  const cards = await getFfPageCards("bgmi");
  const title = cards.hero.title.trim() || fallbackTitle;
  const description = cards.seo.description.trim() || fallbackDescription;
  const keywords = cards.seo.keywords.length
    ? cards.seo.keywords
    : [
        "BGMI sensitivity calculator",
        "BGMI sensitivity settings",
        "BGMI no recoil settings",
        "BGMI gyroscope sensitivity",
        "BGMI ADS sensitivity",
        "BGMI camera sensitivity",
      ];
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical },
    ...buildSocialMetadata({ title, description, url: canonical }),
  };
}

export default async function BgmiPage() {
  // Shared UI lives in (games)/layout — title is RSC so LCP paints without client JS.
  const cards = await getFfPageCards("bgmi");
  const title = cards.hero.title.trim() || fallbackTitle;
  return <h1 className="main-title">{title}</h1>;
}
