"use client";

import { usePathname } from "next/navigation";
import { FfCalculator } from "@/src/features/ffCalculator/FfCalculator";
import "@/src/features/ffCalculator/ffCalculator.css";
import { SensCalculator } from "@/src/features/sensCalculator/SensCalculator";
import type { FfTrustBarItem } from "@/src/lib/ffTrustBar";

type Props = {
  phoneModels: string[];
  ffTrustBar?: FfTrustBarItem[];
};

export function SensCalculatorHost({ phoneModels, ffTrustBar }: Props) {
  const pathname = usePathname() ?? "";

  if (pathname === "/" || pathname === "") {
    return (
      <div id="ff-calculator" className="ff-calculator-anchor">
        <FfCalculator key="freefire" trustBar={ffTrustBar} />
      </div>
    );
  }

  const game =
    pathname === "/pubg" || pathname.startsWith("/pubg/") ? "pubg" : "bgmi";

  return <SensCalculator key={game} phoneModels={phoneModels} game={game} />;
}
