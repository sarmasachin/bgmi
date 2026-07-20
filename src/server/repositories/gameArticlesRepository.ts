import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";
import { sanitizeHtml } from "@/src/lib/sanitizeHtml";

const KEY_BGMI = "settings:gameArticle:bgmi";
const KEY_PUBG = "settings:gameArticle:pubg";

export type GameArticleGame = "bgmi" | "pubg";

function keyFor(game: GameArticleGame) {
  return game === "pubg" ? KEY_PUBG : KEY_BGMI;
}

function parseHtml(raw: unknown): string | null {
  if (typeof raw === "string") {
    const t = raw.trim();
    return t ? t : null;
  }
  if (raw && typeof raw === "object" && "html" in raw) {
    const html = (raw as { html?: unknown }).html;
    if (typeof html === "string" && html.trim()) return html.trim();
  }
  return null;
}

/** Published article HTML for home BGMI/PUBG block. null = use built-in default article. */
export async function getGameArticleHtml(game: GameArticleGame): Promise<string | null> {
  const row = await tryPrisma(async () =>
    prisma.siteSetting.findUnique({ where: { key: keyFor(game) } }),
  );
  if (row === null || !row?.value) return null;
  return parseHtml(row.value);
}

export async function getGameArticlesForAdmin() {
  const [bgmi, pubg] = await Promise.all([
    getGameArticleHtml("bgmi"),
    getGameArticleHtml("pubg"),
  ]);
  return {
    bgmiHtml: bgmi ?? "",
    pubgHtml: pubg ?? "",
    bgmiUsingDefault: bgmi === null,
    pubgUsingDefault: pubg === null,
  };
}

export async function saveGameArticleHtml(game: GameArticleGame, html: string) {
  const cleaned = sanitizeHtml(html ?? "").trim();
  const key = keyFor(game);

  // Empty string clears override → site shows built-in default again.
  if (!cleaned) {
    const deleted = await tryPrismaLong(async () => {
      await prisma.siteSetting.deleteMany({ where: { key } });
      return true;
    });
    if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
    return { html: "", usingDefault: true };
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
  return { html: cleaned, usingDefault: false };
}
