"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { FfCalculator } from "@/src/features/ffCalculator/FfCalculator";
import "@/src/features/ffCalculator/ffCalculator.css";
import { LiteSensCalculator } from "@/src/features/sensCalculator/LiteSensCalculator";
import { SensCalculator } from "@/src/features/sensCalculator/SensCalculator";
import { isBgmiLitePath, isPubgMobileLitePath } from "@/src/lib/gamePagePath";
import type { FfTrustBarItem } from "@/src/lib/ffTrustBar";
import type { FfHomeCalcBanner } from "@/src/lib/homeCardsTypes";

type Props = {
  phoneModels: string[];
  ffTrustBar?: FfTrustBarItem[];
  bgmiLiteBanner?: FfHomeCalcBanner;
  pubgLiteBanner?: FfHomeCalcBanner;
  /** Mobile ad above the FF trust bar, or under BGMI / PUBG / lite calculators. */
  aboveTrustAd?: ReactNode;
};

export function SensCalculatorHost({
  phoneModels,
  ffTrustBar,
  bgmiLiteBanner,
  pubgLiteBanner,
  aboveTrustAd,
}: Props) {
  const pathname = usePathname() ?? "";

  if (pathname === "/" || pathname === "") {
    return (
      <div id="ff-calculator" className="ff-calculator-anchor">
        <FfCalculator
          key="freefire"
          trustBar={ffTrustBar}
          showPlayStoreCta
          aboveTrustAd={aboveTrustAd}
        />
      </div>
    );
  }

  if (isBgmiLitePath(pathname)) {
    return (
      <>
        <LiteSensCalculator
          key="bgmi-lite"
          phoneModels={phoneModels}
          brand="bgmi-lite"
          banner={bgmiLiteBanner}
        />
        {aboveTrustAd}
      </>
    );
  }

  if (isPubgMobileLitePath(pathname)) {
    return (
      <>
        <LiteSensCalculator
          key="pubg-mobile-lite"
          phoneModels={phoneModels}
          brand="pubg-mobile-lite"
          banner={pubgLiteBanner}
        />
        {aboveTrustAd}
      </>
    );
  }

  const game =
    pathname === "/pubg" || pathname.startsWith("/pubg/") ? "pubg" : "bgmi";

  return (
    <>
      <SensCalculator key={game} phoneModels={phoneModels} game={game} />
      {aboveTrustAd}
    </>
  );
}
