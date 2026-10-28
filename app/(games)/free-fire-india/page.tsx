import type { Metadata } from "next";
import { HomeTitleDummyAd } from "@/src/components/HomeTitleDummyAd";
import { FREE_FIRE_INDIA_PATH } from "@/src/lib/gamePagePath";
import { toCanonicalUrl } from "@/src/lib/siteUrl";
import { buildSocialMetadata } from "@/src/lib/socialMeta";

const title = "Free Fire India Sensitivity Calculator";
const description =
  "Free Fire India sensitivity calculator for General, Red Dot, 2x, 4x, sniper scope, and free look. Get RAM and DPI based settings for your phone.";
const canonical = toCanonicalUrl(FREE_FIRE_INDIA_PATH);

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: [
    "Free Fire India sensitivity calculator",
    "Free Fire India sensitivity settings",
    "Free Fire India RAM sensitivity",
    "Free Fire India DPI settings",
    "Free Fire India Red Dot sensitivity",
    "Free Fire India sniper sensitivity",
  ],
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
    image: "/og-home-freefire.png",
    imageAlt: "Free Fire India Sensitivity Calculator",
  }),
};

export default function FreeFireIndiaPage() {
  return (
    <>
      <h1 className="main-title ff-gradient-title">{title}</h1>
      <HomeTitleDummyAd />
    </>
  );
}
