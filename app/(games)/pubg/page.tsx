import type { Metadata } from "next";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { getFfPageCards } from "@/src/server/repositories/homeCardsRepository";

const fallbackTitle = "PUBG Mobile Sensitivity Calculator | Free No Recoil Settings 2026";
const fallbackDescription =
  "Free PUBG Mobile sensitivity calculator for camera, ADS, and gyroscope. Get custom no-recoil presets matched to your device and play style.";
const canonical = toCanonicalUrl("/pubg");

export async function generateMetadata(): Promise<Metadata> {
  const cards = await getFfPageCards("pubg");
  const title = cards.hero.title.trim() || fallbackTitle;
  const description = cards.seo.description.trim() || fallbackDescription;
  const keywords = cards.seo.keywords.length
    ? cards.seo.keywords
    : [
        "PUBG Mobile sensitivity calculator",
        "PUBG sensitivity settings",
        "PUBG no recoil settings",
        "PUBG gyroscope sensitivity",
        "PUBG ADS sensitivity",
        "PUBG camera sensitivity",
      ];
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical },
    ...buildSocialMetadata({ title, description, url: canonical }),
  };
}

export default async function PubgPage() {
  // Shared UI lives in (games)/layout — title is RSC so LCP paints without client JS.
  const cards = await getFfPageCards("pubg");
  const title = cards.hero.title.trim() || fallbackTitle;
  return <h1 className="main-title">{title}</h1>;
}
