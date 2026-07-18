import { cache } from "react";
import { prisma, tryPrisma } from "@/src/server/dbSafe";

const KEY = "settings:adPlacements";

export type AdPlacementVisibility = {
  home: {
    home_above_calculator: boolean;
    home_between_tool_and_article: boolean;
  };
  newsArticle: {
    news_detail_top: boolean;
    news_detail_mid: boolean;
    news_detail_bottom: boolean;
  };
};

export const DEFAULT_AD_PLACEMENT_VISIBILITY: AdPlacementVisibility = {
  home: {
    home_above_calculator: true,
    home_between_tool_and_article: true,
  },
  newsArticle: {
    news_detail_top: false,
    news_detail_mid: true,
    news_detail_bottom: false,
  },
};

let mockVisibility: AdPlacementVisibility = structuredClone(DEFAULT_AD_PLACEMENT_VISIBILITY);

function mergeVisibility(raw: unknown): AdPlacementVisibility {
  const out = structuredClone(DEFAULT_AD_PLACEMENT_VISIBILITY);
  if (!raw || typeof raw !== "object") return out;
  const o = raw as Record<string, unknown>;
  if (o.home && typeof o.home === "object") {
    const h = o.home as Record<string, unknown>;
    if (typeof h.home_above_calculator === "boolean") {
      out.home.home_above_calculator = h.home_above_calculator;
    }
    if (typeof h.home_between_tool_and_article === "boolean") {
      out.home.home_between_tool_and_article = h.home_between_tool_and_article;
    }
  }
  if (o.newsArticle && typeof o.newsArticle === "object") {
    const n = o.newsArticle as Record<string, unknown>;
    if (typeof n.news_detail_top === "boolean") out.newsArticle.news_detail_top = n.news_detail_top;
    if (typeof n.news_detail_mid === "boolean") out.newsArticle.news_detail_mid = n.news_detail_mid;
    if (typeof n.news_detail_bottom === "boolean") {
      out.newsArticle.news_detail_bottom = n.news_detail_bottom;
    }
  }
  return out;
}

export const getAdPlacementVisibility = cache(async function getAdPlacementVisibility() {
  if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production") {
    return structuredClone(mockVisibility);
  }
  const row = await tryPrisma(() => prisma.siteSetting.findUnique({ where: { key: KEY } }));
  return mergeVisibility(row?.value);
});

export async function saveAdPlacementVisibility(input: AdPlacementVisibility): Promise<void> {
  const merged = mergeVisibility(input);
  mockVisibility = merged;
  await tryPrisma(async () => {
    await prisma.siteSetting.upsert({
      where: { key: KEY },
      create: { key: KEY, value: merged as object },
      update: { value: merged as object },
    });
  });
}
