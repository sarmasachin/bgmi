"use client";

import { usePathname } from "next/navigation";
import { ArticleFaqContent } from "@/src/components/ArticleFaqContent";
import type { HomeFaqItem } from "@/src/server/repositories/homeFaqRepository";

type Props = {
  bgmiFaqItems: HomeFaqItem[];
  pubgFaqItems: HomeFaqItem[];
  bgmiArticleHtml?: string | null;
  pubgArticleHtml?: string | null;
};

/** Client FAQ wrapper so game label updates instantly with / ↔ /pubg. */
export function GameArticleFaq({
  bgmiFaqItems,
  pubgFaqItems,
  bgmiArticleHtml,
  pubgArticleHtml,
}: Props) {
  const pathname = usePathname() ?? "";
  const game = pathname === "/pubg" || pathname.startsWith("/pubg/") ? "pubg" : "bgmi";
  const articleHtml = game === "pubg" ? pubgArticleHtml : bgmiArticleHtml;
  const faqItems = game === "pubg" ? pubgFaqItems : bgmiFaqItems;

  return (
    <ArticleFaqContent
      wrapperClassName="light-content--after-home-calculator"
      faqItems={faqItems}
      game={game}
      articleHtml={articleHtml}
    />
  );
}
