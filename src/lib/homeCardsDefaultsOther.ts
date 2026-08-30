import type { FfHomeCards } from "@/src/lib/homeCardsTypes";
import { getDefaultFfHomeCards } from "@/src/lib/homeCardsDefaultsFreefire";

export function getDefaultBgmiCards(): FfHomeCards {
  const home = getDefaultFfHomeCards();
  return {
    ...home,
    seo: {
      description:
        "Free BGMI sensitivity calculator for camera, ADS, and gyroscope. Generate custom settings for your phone, FPS mode, and play style.",
      keywords: [
        "BGMI sensitivity calculator",
        "BGMI sensitivity settings",
        "BGMI gyroscope sensitivity",
        "BGMI ADS sensitivity",
        "BGMI camera sensitivity",
        "BGMI free sensitivity",
        "BGMI 2026 sensitivity",
      ],
    },
    hero: {
      title: "BGMI Sensitivity Calculator",
    },
  };
}

/** Built-in BGMI Lite page cards — full Lite sections (not Free Fire). */
export { getDefaultBgmiLiteCards } from "@/src/lib/homeCardsDefaultsBgmiLite";

/** Built-in PUBG Mobile Lite page cards — same Lite layout, PUBG branding. */
export { getDefaultPubgMobileLiteCards } from "@/src/lib/homeCardsDefaultsPubgMobileLite";

/** Built-in PUBG page SEO + hero — used until admin saves overrides. */
export function getDefaultPubgCards(): FfHomeCards {
  const home = getDefaultFfHomeCards();
  return {
    ...home,
    seo: {
      description:
        "Free PUBG Mobile sensitivity calculator for camera, ADS, and gyroscope. Get custom presets matched to your device and play style.",
      keywords: [
        "PUBG Mobile sensitivity calculator",
        "PUBG sensitivity settings",
        "PUBG gyroscope sensitivity",
        "PUBG ADS sensitivity",
        "PUBG camera sensitivity",
        "PUBG Mobile free sensitivity",
        "PUBG Mobile 2026 sensitivity",
      ],
    },
    hero: {
      title: "PUBG Mobile Sensitivity Calculator",
    },
  };
}

/** Built-in PUBG Mobile Code page SEO + hero — used until admin saves overrides. */
export function getDefaultPubgMobileCodesCards(): FfHomeCards {
  const home = getDefaultFfHomeCards();
  return {
    ...home,
    seo: {
      description:
        "PUBG Mobile Sensitivity Settings Code — calculate sensitivity, copy codes for Android, and view camera / ADS settings for your device.",
      keywords: [
        "PUBG Mobile sensitivity code",
        "PUBG Mobile sensitivity settings code",
        "PUBG Mobile code",
        "PUBG sensitivity code Android",
        "PUBG Mobile camera sensitivity code",
        "PUBG Mobile ADS sensitivity code",
        "PUBG Mobile copy sensitivity code",
        "PUBG Mobile no recoil code",
      ],
    },
    hero: {
      title: "PUBG Mobile Sensitivity Settings Code",
    },
  };
}

