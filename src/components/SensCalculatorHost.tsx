"use client";

import { usePathname } from "next/navigation";
import { FfCalculator } from "@/src/features/ffCalculator/FfCalculator";
import "@/src/features/ffCalculator/ffCalculator.css";
import { SensCalculator } from "@/src/features/sensCalculator/SensCalculator";

type Props = {
  phoneModels: string[];
};

export function SensCalculatorHost({ phoneModels }: Props) {
  const pathname = usePathname() ?? "";

  if (pathname === "/" || pathname === "") {
    return <FfCalculator key="freefire" />;
  }

  const game =
    pathname === "/pubg" || pathname.startsWith("/pubg/") ? "pubg" : "bgmi";

  return <SensCalculator key={game} phoneModels={phoneModels} game={game} />;
}
