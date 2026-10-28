"use client";

import { usePathname } from "next/navigation";
import {
  isBgmiLitePath,
  isFreeFireIndiaPath,
  isHomeFfPath,
  isPubgMobileLitePath,
} from "@/src/lib/gamePagePath";

type JsonLd = Record<string, unknown> | null;

type Props = {
  bgmiFaqSchema: JsonLd;
  bgmiLiteFaqSchema?: JsonLd;
  pubgFaqSchema: JsonLd;
  pubgMobileLiteFaqSchema?: JsonLd;
  freefireFaqSchema?: JsonLd;
  bgmiToolSchema: JsonLd;
  bgmiLiteToolSchema?: JsonLd;
  pubgToolSchema: JsonLd;
  pubgMobileLiteToolSchema?: JsonLd;
  freefireToolSchema?: JsonLd;
  freefireIndiaToolSchema?: JsonLd;
};

/** Emits FAQ + tool WebApplication JSON-LD for the active game route only. */
export function GamePathJsonLd({
  bgmiFaqSchema,
  bgmiLiteFaqSchema = null,
  pubgFaqSchema,
  pubgMobileLiteFaqSchema = null,
  freefireFaqSchema = null,
  bgmiToolSchema,
  bgmiLiteToolSchema = null,
  pubgToolSchema,
  pubgMobileLiteToolSchema = null,
  freefireToolSchema = null,
  freefireIndiaToolSchema = null,
}: Props) {
  const pathname = usePathname() ?? "";
  const isIndia = isFreeFireIndiaPath(pathname);
  const isHome = !isIndia && isHomeFfPath(pathname);
  const isPubgMobileLite = isPubgMobileLitePath(pathname);
  const isPubg = pathname === "/pubg" || pathname.startsWith("/pubg/");
  const isLite = isBgmiLitePath(pathname);

  const faqSchema = isHome || isIndia
    ? freefireFaqSchema
    : isPubgMobileLite
      ? pubgMobileLiteFaqSchema
      : isPubg
        ? pubgFaqSchema
        : isLite
          ? bgmiLiteFaqSchema
          : bgmiFaqSchema;
  const toolSchema = isIndia
    ? freefireIndiaToolSchema
    : isHome
    ? freefireToolSchema
    : isPubgMobileLite
      ? pubgMobileLiteToolSchema
      : isPubg
        ? pubgToolSchema
        : isLite
          ? bgmiLiteToolSchema
          : bgmiToolSchema;

  return (
    <>
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      {toolSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
        />
      ) : null}
    </>
  );
}
