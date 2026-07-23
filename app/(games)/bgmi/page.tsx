import type { Metadata } from "next";
import { getSettings } from "@/src/server/repositories/settingsRepository";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";

const title = "BGMI Sensitivity Calculator | Free No Recoil Settings 2026";
const description =
  "Free BGMI sensitivity calculator for camera, ADS, and gyroscope. Generate custom no-recoil settings for your phone, FPS mode, and play style.";
const canonical = toCanonicalUrl("/bgmi");

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical },
  ...buildSocialMetadata({ title, description, url: canonical }),
};

export default async function BgmiPage() {
  // Shared UI lives in (games)/layout — title is RSC so LCP paints without client JS.
  const settings = await getSettings();
  return <h1 className="main-title">{settings.homeDisplay.heroTitle}</h1>;
}
