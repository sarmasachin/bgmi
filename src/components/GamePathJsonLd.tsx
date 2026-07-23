"use client";

import { usePathname } from "next/navigation";

type JsonLd = Record<string, unknown> | null;

type Props = {
  bgmiFaqSchema: JsonLd;
  pubgFaqSchema: JsonLd;
  freefireFaqSchema?: JsonLd;
  bgmiToolSchema: JsonLd;
  pubgToolSchema: JsonLd;
  freefireToolSchema?: JsonLd;
};

/** Emits FAQ + tool WebApplication JSON-LD for the active game route only. */
export function GamePathJsonLd({
  bgmiFaqSchema,
  pubgFaqSchema,
  freefireFaqSchema = null,
  bgmiToolSchema,
  pubgToolSchema,
  freefireToolSchema = null,
}: Props) {
  const pathname = usePathname() ?? "";
  const isHome = pathname === "/" || pathname === "";
  const isPubg = pathname === "/pubg" || pathname.startsWith("/pubg/");
  const faqSchema = isHome ? freefireFaqSchema : isPubg ? pubgFaqSchema : bgmiFaqSchema;
  const toolSchema = isHome ? freefireToolSchema : isPubg ? pubgToolSchema : bgmiToolSchema;

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
