"use client";

import { usePathname } from "next/navigation";
import { ArticleFaqContent } from "@/src/components/ArticleFaqContent";
import type { HomeFaqItem } from "@/src/server/repositories/homeFaqRepository";

type Props = {
  bgmiFaqItems: HomeFaqItem[];
  pubgFaqItems: HomeFaqItem[];
  freefireFaqItems?: HomeFaqItem[];
  bgmiArticleHtml?: string | null;
  pubgArticleHtml?: string | null;
  freefireArticleHtml?: string | null;
};

/** Client FAQ wrapper so game label updates instantly with route changes. */
export function GameArticleFaq({
  bgmiFaqItems,
  pubgFaqItems,
  freefireFaqItems = [],
  bgmiArticleHtml,
  pubgArticleHtml,
  freefireArticleHtml,
}: Props) {
  const pathname = usePathname() ?? "";
  const game =
    pathname === "/" || pathname === ""
      ? "freefire"
      : pathname === "/pubg" || pathname.startsWith("/pubg/")
        ? "pubg"
        : "bgmi";
  const articleHtml =
    game === "freefire"
      ? freefireArticleHtml
      : game === "pubg"
        ? pubgArticleHtml
        : bgmiArticleHtml;
  const faqItems =
    game === "freefire"
      ? freefireFaqItems
      : game === "pubg"
        ? pubgFaqItems
        : bgmiFaqItems;

  return (
    <ArticleFaqContent
      wrapperClassName="light-content--after-home-calculator"
      faqItems={faqItems}
      game={game === "freefire" ? "bgmi" : game}
      articleHtml={articleHtml}
    />
  );
}
