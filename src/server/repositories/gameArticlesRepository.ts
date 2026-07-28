import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";
import { DEFAULT_BGMI_ARTICLE_HTML } from "@/src/lib/bgmiArticleDefault";
import { freeFireConfig } from "@/src/lib/freeFirePages";
import {
  GAME_ARTICLE_GAMES,
  type GameArticleGame,
} from "@/src/lib/gameArticleGames";
import { DEFAULT_PUBG_ARTICLE_HTML } from "@/src/lib/pubgArticleDefault";
import { DEFAULT_PUBG_MOBILE_CODES_ARTICLE_HTML } from "@/src/lib/pubgMobileCodesArticleDefault";
import { gameContentToSitemapPath } from "@/src/lib/sitemapLastmod";
import { sanitizeHtml } from "@/src/lib/sanitizeHtml";
import { bumpSitemapLastmod } from "@/src/server/repositories/sitemapLastmodRepository";

export type { GameArticleGame };
export { GAME_ARTICLE_GAMES };

const KEYS: Record<GameArticleGame, string> = {
  bgmi: "settings:gameArticle:bgmi",
  pubg: "settings:gameArticle:pubg",
  freefire: "settings:gameArticle:freefire",
  "freefire-max": "settings:gameArticle:freefire-max",
  "pubg-mobile-codes": "settings:gameArticle:pubg-mobile-codes",
};

function keyFor(game: GameArticleGame) {
  return KEYS[game];
}

/** True when HTML has real readable text (not empty editor junk). */
export function isMeaningfulArticleHtml(html: string): boolean {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length >= 40;
}

function parseHtml(raw: unknown): string | null {
  let html: string | null = null;
  if (typeof raw === "string") {
    const t = raw.trim();
    html = t || null;
  } else if (raw && typeof raw === "object" && "html" in raw) {
    const value = (raw as { html?: unknown }).html;
    if (typeof value === "string" && value.trim()) html = value.trim();
  }
  if (!html || !isMeaningfulArticleHtml(html)) return null;
  return html;
}

export function builtInDefaultHtml(game: GameArticleGame): string {
  if (game === "freefire") return freeFireConfig("freefire").defaultArticleHtml;
  if (game === "freefire-max") return freeFireConfig("freefire-max").defaultArticleHtml;
  if (game === "pubg-mobile-codes") return DEFAULT_PUBG_MOBILE_CODES_ARTICLE_HTML;
  if (game === "bgmi") return DEFAULT_BGMI_ARTICLE_HTML;
  if (game === "pubg") return DEFAULT_PUBG_ARTICLE_HTML;
  return "";
}

/** Custom article HTML from admin. null = use built-in default article. */
export async function getGameArticleHtml(game: GameArticleGame): Promise<string | null> {
  const row = await tryPrisma(async () =>
    prisma.siteSetting.findUnique({ where: { key: keyFor(game) } }),
  );
  if (row === null || !row?.value) return null;
  return parseHtml(row.value);
}

export async function getGameArticlesForAdmin() {
  const [bgmi, pubg, freefire, freefireMax, pubgMobileCodes] = await Promise.all([
    getGameArticleHtml("bgmi"),
    getGameArticleHtml("pubg"),
    getGameArticleHtml("freefire"),
    getGameArticleHtml("freefire-max"),
    getGameArticleHtml("pubg-mobile-codes"),
  ]);
  return {
    // Show built-in defaults in the editor while still on default (like Free Fire).
    bgmiHtml: bgmi ?? builtInDefaultHtml("bgmi"),
    pubgHtml: pubg ?? builtInDefaultHtml("pubg"),
    freefireHtml: freefire ?? builtInDefaultHtml("freefire"),
    freefireMaxHtml: freefireMax ?? builtInDefaultHtml("freefire-max"),
    pubgMobileCodesHtml: pubgMobileCodes ?? builtInDefaultHtml("pubg-mobile-codes"),
    bgmiUsingDefault: bgmi === null,
    pubgUsingDefault: pubg === null,
    freefireUsingDefault: freefire === null,
    freefireMaxUsingDefault: freefireMax === null,
    pubgMobileCodesUsingDefault: pubgMobileCodes === null,
  };
}

export async function saveGameArticleHtml(game: GameArticleGame, html: string) {
  const cleaned = sanitizeHtml(html ?? "").trim();
  const key = keyFor(game);

  // Empty / near-empty clears override → site shows built-in default again.
  if (!cleaned || !isMeaningfulArticleHtml(cleaned)) {
    const deleted = await tryPrismaLong(async () => {
      await prisma.siteSetting.deleteMany({ where: { key } });
      return true;
    });
    if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
    const path = gameContentToSitemapPath(game);
    if (path) bumpSitemapLastmod([path]);
    return { html: builtInDefaultHtml(game), usingDefault: true };
  }

  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: { html: cleaned } },
      update: { value: { html: cleaned } },
    });
    return cleaned;
  });
  if (saved === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  const path = gameContentToSitemapPath(game);
  if (path) bumpSitemapLastmod([path]);
  return { html: cleaned, usingDefault: false };
}
