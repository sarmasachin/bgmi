import type { Metadata } from "next";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";
import { getFfHomeCards } from "@/src/server/repositories/homeCardsRepository";

const fallbackTitle = "Free Fire & FF Max Sensitivity Settings Calculator";
const fallbackDescription =
  "Free Fire & FF Max sensitivity settings calculator. Get updated sensitivity, DPI settings, and control layout for all RAM devices (2GB–8GB).";
const canonical = toCanonicalUrl("/");

export async function generateMetadata(): Promise<Metadata> {
  const cards = await getFfHomeCards();
  const title = cards.hero.title.trim() || fallbackTitle;
  const description = cards.seo.description.trim() || fallbackDescription;
  const keywords = cards.seo.keywords.length
    ? cards.seo.keywords
    : [
        "Free Fire sensitivity calculator",
        "Free Fire sensitivity settings",
        "Free Fire RAM sensitivity",
        "Free Fire DPI settings",
        "Free Fire Red Dot sensitivity",
        "Free Fire Max sensitivity",
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
      image: "/icon.png?v=3",
      imageAlt: "Sensitivity Settings calculator",
    }),
  };
}

export default async function HomePage() {
  const cards = await getFfHomeCards();
  const title = cards.hero.title.trim() || fallbackTitle;
  return <h1 className="main-title ff-gradient-title">{title}</h1>;
}
