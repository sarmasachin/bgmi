"use client";

import { usePathname } from "next/navigation";
import { SensCalculator } from "@/src/features/sensCalculator/SensCalculator";

type Props = {
  phoneModels: string[];
};

export function SensCalculatorHost({ phoneModels }: Props) {
  const pathname = usePathname() ?? "";
  const game = pathname === "/pubg" || pathname.startsWith("/pubg/") ? "pubg" : "bgmi";

  return <SensCalculator key={game} phoneModels={phoneModels} game={game} />;
}
