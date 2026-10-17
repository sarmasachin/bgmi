import type { FfHomeCards } from "@/src/lib/homeCardsTypes";
import { getDefaultBgmiLiteCards } from "@/src/lib/homeCardsDefaultsBgmiLite";
import { PUBG_MOBILE_LITE_PATH } from "@/src/lib/pubgMobileLite";

/**
 * Built-in /pubg-mobile-lite page cards — same Lite layout as BGMI Air,
 * rebranded for PUBG Mobile Flash (shared CSS/components).
 */
export function getDefaultPubgMobileLiteCards(): FfHomeCards {
  const raw = JSON.stringify(getDefaultBgmiLiteCards())
    .replaceAll("BGMI Air", "PUBG Mobile Flash")
    .replaceAll("/bgmi-lite", PUBG_MOBILE_LITE_PATH)
    .replaceAll("bgmi-lite", "pubg-mobile-lite")
    .replaceAll("full BGMI", "full PUBG Mobile")
    .replaceAll("Full BGMI", "Full PUBG Mobile")
    .replaceAll("/bgmi", "/pubg")
    .replaceAll("BGMI", "PUBG Mobile")
    .replaceAll("Krafton India", "PUBG Mobile Flash")
    .replaceAll("Krafton", "PUBG / Krafton");

  const cards = JSON.parse(raw) as FfHomeCards;
  cards.seo = {
    description:
      "Free PUBG Mobile Flash sensitivity calculator for 2GB–4GB phones. Camera, ADS, and Gyroscope settings tuned for 30–60 FPS entry devices.",
    keywords: [
      "PUBG Mobile Flash sensitivity calculator",
      "PUBG Mobile Flash sensitivity settings",
      "PUBG Flash 2GB RAM sensitivity",
      "PUBG Mobile Flash gyroscope",
      "PUBG Mobile Flash ADS",
      "PUBG Mobile Flash camera sensitivity",
    ],
  };
  cards.hero = { title: "PUBG Mobile Flash Sensitivity Calculator" };
  cards.calcBanner = {
    strong: "PUBG Mobile Flash calculator",
    rest: " — tuned for entry phones (~2GB RAM, 30–60 FPS). Values follow PUBG Mobile Flash / low-end research. Apply in Settings → Sensitivity, then fine-tune in Training Ground.",
  };
  cards.explore = {
    title: "More PUBG tools",
    freefire: {
      title: "PUBG Mobile calculator",
      text: "Full PUBG Mobile sensitivity — Camera & ADS/Gyro for mid and flagship phones.",
      points: [
        "60 / 90 / 120 FPS presets",
        "Separate from this PUBG Mobile Flash tool",
        "Open /pubg anytime",
      ],
      buttonLabel: "Open PUBG calculator",
      href: "/pubg",
    },
    freefireMax: {
      title: "PUBG Mobile Code",
      text: "Generate shareable PUBG Mobile sensitivity codes for friends and alts.",
      points: ["Fresh codes", "Phone-matched presets", "Pair with PUBG Mobile Flash sensi above"],
      buttonLabel: "Open PUBG Mobile Code",
      href: "/pubg-mobile-codes",
    },
  };
  return cards;
}
