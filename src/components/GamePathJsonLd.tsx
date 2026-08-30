"use client";

import { usePathname } from "next/navigation";
import { isPubgMobileLitePath } from "@/src/lib/gamePagePath";

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
}: Props) {
  const pathname = usePathname() ?? "";
  const isHome = pathname === "/" || pathname === "";
  const isPubgMobileLite = isPubgMobileLitePath(pathname);
  const isPubg = pathname === "/pubg" || pathname.startsWith("/pubg/");
  const isLite =
    pathname === "/bgmi-lite" || pathname.startsWith("/bgmi-lite/");

  const faqSchema = isHome
    ? freefireFaqSchema
    : isPubgMobileLite
      ? pubgMobileLiteFaqSchema
      : isPubg
        ? pubgFaqSchema
        : isLite
          ? bgmiLiteFaqSchema
          : bgmiFaqSchema;
  const toolSchema = isHome
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
