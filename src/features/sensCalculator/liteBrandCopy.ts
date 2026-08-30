import type { LiteCalcBrand } from "@/src/lib/gamePagePath";
import type { LiteScopeResult } from "./liteCalculator";

export function liteBrandCopy(brand: LiteCalcBrand) {
  if (brand === "pubg-mobile-lite") {
    return {
      id: "pubg-mobile-lite-calculator",
      bannerStrong: "PUBG Mobile Lite calculator",
      bannerRest:
        " — tuned for entry phones (~2GB RAM, 30–60 FPS). Values follow Lite-family / low-end research. Apply in Settings → Sensitivity, then fine-tune in Training Ground.",
      empty:
        "Enter device details and tap Calculate for PUBG Mobile Lite Camera, ADS, and Gyroscope values.",
      copyTitle: "PUBG Mobile Lite Sensitivity (provisional)",
    };
  }
  return {
    id: "bgmi-lite-calculator",
    bannerStrong: "BGMI Lite calculator",
    bannerRest:
      " — tuned for entry phones (~2GB RAM, 30–60 FPS). Values follow Lite-family / low-end research until Krafton publishes final Lite specs. Apply in Settings → Sensitivity, then fine-tune in Training Ground.",
    empty:
      "Enter device details and tap Calculate for BGMI Lite Camera, ADS, and Gyroscope values.",
    copyTitle: "BGMI Lite Sensitivity (provisional)",
  };
}

export function formatLiteResultsText(results: LiteScopeResult[], title: string): string {
  return [
    title,
    "",
    "CAMERA",
    ...results.map((r) => `${r.name}: ${r.camera}%`),
    "",
    "ADS",
    ...results.map((r) => `${r.name}: ${r.ads}%`),
    "",
    "GYROSCOPE",
    ...results.map((r) => `${r.name}: ${r.gyro}%`),
    "",
    "Tip: Use Scope On on 2GB phones. Tune ±5 in Training Ground.",
  ].join("\n");
}
