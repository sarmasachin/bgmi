import type { Metadata } from "next";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";

const title = "Free Fire & FF Max Sensitivity Settings for headshot";
const description =
  "Best Free Fire & FF Max sensitivity settings for auto headshots. Get updated FF sensitivity, DPI settings & control layout for all RAM devices (2GB-8GB).";
const canonical = toCanonicalUrl("/");

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: [
    "Free Fire sensitivity calculator",
    "Free Fire sensitivity settings",
    "Free Fire headshot sensitivity",
    "Free Fire one tap headshot",
    "Free Fire RAM sensitivity",
    "Free Fire DPI settings",
    "Free Fire Red Dot sensitivity",
    "Free Fire Max sensitivity",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical },
  ...buildSocialMetadata({ title, description, url: canonical }),
};

export default function HomePage() {
  // Shared UI lives in (games)/layout — Free Fire calculator on home.
  return <h1 className="main-title ff-gradient-title">{title}</h1>;
}
