import type { FfHomeCards } from "@/src/lib/homeCardsTypes";
import { getDefaultBgmiLiteCards } from "@/src/lib/homeCardsDefaultsBgmiLite";
import { PUBG_MOBILE_LITE_PATH } from "@/src/lib/pubgMobileLite";

/**
 * Built-in /pubg-mobile-lite page cards — same Lite layout as BGMI Lite,
 * rebranded for PUBG Mobile Lite (shared CSS/components).
 */
export function getDefaultPubgMobileLiteCards(): FfHomeCards {
  const raw = JSON.stringify(getDefaultBgmiLiteCards())
    .replaceAll("BGMI Lite", "PUBG Mobile Lite")
    .replaceAll("/bgmi-lite", PUBG_MOBILE_LITE_PATH)
    .replaceAll("bgmi-lite", "pubg-mobile-lite")
    .replaceAll("full BGMI", "full PUBG Mobile")
    .replaceAll("Full BGMI", "Full PUBG Mobile")
    .replaceAll("/bgmi", "/pubg")
    .replaceAll("BGMI", "PUBG Mobile")
    .replaceAll("Krafton India", "PUBG Mobile Lite")
    .replaceAll("Krafton", "PUBG / Krafton");

  const cards = JSON.parse(raw) as FfHomeCards;
  cards.seo = {
    description:
      "Free PUBG Mobile Lite sensitivity calculator for 2GB–4GB phones. Camera, ADS, and Gyroscope settings tuned for 30–60 FPS entry devices.",
    keywords: [
      "PUBG Mobile Lite sensitivity calculator",
      "PUBG Mobile Lite sensitivity settings",
      "PUBG Lite 2GB RAM sensitivity",
      "PUBG Mobile Lite gyroscope",
      "PUBG Mobile Lite ADS",
      "PUBG Mobile Lite camera sensitivity",
    ],
  };
  cards.hero = { title: "PUBG Mobile Lite Sensitivity Calculator" };
  cards.calcBanner = {
    strong: "PUBG Mobile Lite calculator",
    rest: " — tuned for entry phones (~2GB RAM, 30–60 FPS). Values follow Lite-family / low-end research. Apply in Settings → Sensitivity, then fine-tune in Training Ground.",
  };
  cards.explore = {
    title: "More PUBG tools",
    freefire: {
      title: "PUBG Mobile calculator",
      text: "Full PUBG Mobile sensitivity — Camera & ADS/Gyro for mid and flagship phones.",
      points: [
        "60 / 90 / 120 FPS presets",
        "Separate from this Lite tool",
        "Open /pubg anytime",
      ],
      buttonLabel: "Open PUBG calculator",
      href: "/pubg",
    },
    freefireMax: {
      title: "PUBG Mobile Code",
      text: "Generate shareable PUBG Mobile sensitivity codes for friends and alts.",
      points: ["Fresh codes", "Phone-matched presets", "Pair with Lite sensi above"],
      buttonLabel: "Open PUBG Mobile Code",
      href: "/pubg-mobile-codes",
    },
  };
  return cards;
}
