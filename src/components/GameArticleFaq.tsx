"use client";

import { usePathname } from "next/navigation";
import { ArticleFaqContent } from "@/src/components/ArticleFaqContent";
import { isPubgMobileLitePath } from "@/src/lib/gamePagePath";
import type { HomeFaqItem } from "@/src/server/repositories/homeFaqRepository";

type Props = {
  bgmiFaqItems: HomeFaqItem[];
  bgmiLiteFaqItems?: HomeFaqItem[];
  pubgFaqItems: HomeFaqItem[];
  pubgMobileLiteFaqItems?: HomeFaqItem[];
  freefireFaqItems?: HomeFaqItem[];
  bgmiArticleHtml?: string | null;
  bgmiLiteArticleHtml?: string | null;
  pubgArticleHtml?: string | null;
  pubgMobileLiteArticleHtml?: string | null;
  freefireArticleHtml?: string | null;
};

/** Client FAQ wrapper so game label updates instantly with route changes. */
export function GameArticleFaq({
  bgmiFaqItems,
  bgmiLiteFaqItems = [],
  pubgFaqItems,
  pubgMobileLiteFaqItems = [],
  freefireFaqItems = [],
  bgmiArticleHtml,
  bgmiLiteArticleHtml,
  pubgArticleHtml,
  pubgMobileLiteArticleHtml,
  freefireArticleHtml,
}: Props) {
  const pathname = usePathname() ?? "";
  const game =
    pathname === "/" || pathname === ""
      ? "freefire"
      : isPubgMobileLitePath(pathname)
        ? "pubg-mobile-lite"
        : pathname === "/pubg" || pathname.startsWith("/pubg/")
          ? "pubg"
          : pathname === "/bgmi-lite" || pathname.startsWith("/bgmi-lite/")
            ? "bgmi-lite"
            : "bgmi";

  const articleHtml =
    game === "freefire"
      ? freefireArticleHtml
      : game === "pubg-mobile-lite"
        ? pubgMobileLiteArticleHtml
        : game === "pubg"
          ? pubgArticleHtml
          : game === "bgmi-lite"
            ? bgmiLiteArticleHtml
            : bgmiArticleHtml;

  const faqItems =
    game === "freefire"
      ? freefireFaqItems
      : game === "pubg-mobile-lite"
        ? pubgMobileLiteFaqItems
        : game === "pubg"
          ? pubgFaqItems
          : game === "bgmi-lite"
            ? bgmiLiteFaqItems
            : bgmiFaqItems;

  const articleGame =
    game === "pubg"
      ? "pubg"
      : game === "pubg-mobile-lite"
        ? "pubg-mobile-lite"
        : game === "bgmi-lite"
          ? "bgmi-lite"
          : "bgmi";

  return (
    <ArticleFaqContent
      wrapperClassName="light-content--after-home-calculator"
      faqItems={faqItems}
      game={articleGame}
      articleHtml={articleHtml}
    />
  );
}
