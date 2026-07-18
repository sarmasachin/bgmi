"use client";

import { usePathname } from "next/navigation";

type Props = {
  bgmiTitle: string;
  pubgTitle?: string;
};

export function GameHeroTitle({
  bgmiTitle,
  pubgTitle = "PUBG Mobile Sensitivity Settings calculator",
}: Props) {
  const pathname = usePathname();
  const isPubg = pathname === "/pubg" || pathname.startsWith("/pubg/");
  return <h1 className="main-title">{isPubg ? pubgTitle : bgmiTitle}</h1>;
}
