import type { Metadata } from "next";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";

const title = "PUBG Mobile Sensitivity Calculator | Free No Recoil Settings 2026";
const description =
  "Free PUBG Mobile sensitivity calculator for camera, ADS, and gyroscope. Get custom no-recoil presets matched to your device and play style.";
const canonical = toCanonicalUrl("/pubg");

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical },
  ...buildSocialMetadata({ title, description, url: canonical }),
};

export default function PubgPage() {
  // Shared UI lives in (games)/layout — title is RSC so LCP paints without client JS.
  return <h1 className="main-title">PUBG Mobile Sensitivity Settings calculator</h1>;
}
