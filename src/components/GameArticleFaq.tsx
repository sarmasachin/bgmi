"use client";

import { usePathname } from "next/navigation";
import { ArticleFaqContent } from "@/src/components/ArticleFaqContent";
import type { HomeFaqItem } from "@/src/server/repositories/homeFaqRepository";

type Props = {
  faqItems: HomeFaqItem[];
};

/** Client FAQ wrapper so game label updates instantly with / ↔ /pubg. */
export function GameArticleFaq({ faqItems }: Props) {
  const pathname = usePathname();
  const game = pathname === "/pubg" || pathname.startsWith("/pubg/") ? "pubg" : "bgmi";

  return (
    <ArticleFaqContent
      wrapperClassName="light-content--after-home-calculator"
      faqItems={faqItems}
      game={game}
    />
  );
}
