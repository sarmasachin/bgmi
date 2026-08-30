/** Client-safe game-article tab metadata (no DB imports). */

export type GameArticleGame =
  | "bgmi"
  | "bgmi-lite"
  | "pubg"
  | "pubg-mobile-lite"
  | "freefire"
  | "freefire-max"
  | "pubg-mobile-codes";

export const GAME_ARTICLE_GAMES: Array<{
  id: GameArticleGame;
  label: string;
  previewPath: string;
}> = [
  { id: "bgmi", label: "BGMI", previewPath: "/bgmi" },
  { id: "bgmi-lite", label: "BGMI Lite", previewPath: "/bgmi-lite" },
  { id: "pubg", label: "PUBG Mobile", previewPath: "/pubg" },
  {
    id: "pubg-mobile-lite",
    label: "PUBG Mobile Lite",
    previewPath: "/pubg-mobile-lite",
  },
  { id: "freefire", label: "Free Fire", previewPath: "/" },
  {
    id: "freefire-max",
    label: "Free Fire Max",
    previewPath: "/free-fire-max-sensitivity-settings-calculator",
  },
  {
    id: "pubg-mobile-codes",
    label: "PUBG Mobile Code",
    previewPath: "/pubg-mobile-codes",
  },
];

/**
 * Official game routes whose article HTML is owned by Game Articles
 * (not Page Clone body). Home `/` maps to Free Fire.
 */
export function articleBodyGameForPageSlug(slug: string): GameArticleGame | null {
  const raw = slug.trim();
  const n = raw.replace(/^\/+|\/+$/g, "").toLowerCase();
  if (raw === "/" || n === "free-fire-sensitivity-settings-calculator") return "freefire";
  if (n === "free-fire-max-sensitivity-settings-calculator") return "freefire-max";
  if (n === "bgmi") return "bgmi";
  if (n === "bgmi-lite") return "bgmi-lite";
  if (n === "pubg") return "pubg";
  if (n === "pubg-mobile-lite") return "pubg-mobile-lite";
  if (n === "pubg-mobile-codes") return "pubg-mobile-codes";
  return null;
}

export function gameArticleLabel(game: GameArticleGame): string {
  return GAME_ARTICLE_GAMES.find((item) => item.id === game)?.label ?? game;
}
