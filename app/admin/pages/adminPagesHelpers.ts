import type { AdminPageRow } from "@/src/server/admin/mapAdminPageRows";

export type TemplateType = "home" | "article" | "landing";
export type CloneGame = "bgmi" | "pubg" | "freefire" | "freefire-max" | "pubg-mobile-codes";
export type PageRow = AdminPageRow;

export type PageMeta = {
  templateType?: TemplateType;
  game?: CloneGame;
  socialTitle?: string;
  socialDescription?: string;
  socialImageAlt?: string;
  keywords?: string;
};

export function coerceTemplateType(value: unknown): TemplateType {
  return value === "article" || value === "landing" || value === "home" ? value : "home";
}

export function coerceCloneGame(value: unknown): CloneGame {
  if (
    value === "pubg" ||
    value === "freefire" ||
    value === "freefire-max" ||
    value === "pubg-mobile-codes"
  ) {
    return value;
  }
  return "bgmi";
}

export function cloneGameLabel(game: CloneGame) {
  if (game === "pubg") return "PUBG Mobile";
  if (game === "pubg-mobile-codes") return "PUBG Mobile Code";
  if (game === "freefire") return "Free Fire";
  if (game === "freefire-max") return "Free Fire Max";
  return "BGMI";
}

export function normalizeSlugInput(next: string) {
  const compact = next.replace(/\s+/g, "-").replace(/-+/g, "-");
  if (!compact) return "";
  return compact.replace(/^\/+/, "").replace(/\/+$/, "").toLowerCase();
}

export function slugifyFromTitle(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s/-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/\/-/g, "/")
    .replace(/-\/+/g, "/")
    .replace(/^-+|-+$/g, "")
    .replace(/^\/+|\/+$/g, "");
}

export function parseContent(content: unknown) {
  if (typeof content === "string") {
    return { html: content, meta: {} as PageMeta };
  }
  if (typeof content === "object" && content !== null) {
    const maybeHtml = (content as { html?: unknown }).html;
    const maybeMeta = (content as { meta?: unknown }).meta;
    const metaObj =
      typeof maybeMeta === "object" && maybeMeta !== null
        ? (maybeMeta as {
            templateType?: unknown;
            game?: unknown;
            socialTitle?: unknown;
            socialDescription?: unknown;
            socialImageAlt?: unknown;
            keywords?: unknown;
          })
        : {};
    return {
      html: typeof maybeHtml === "string" ? maybeHtml : "",
      meta: {
        templateType:
          metaObj.templateType === "home" ||
          metaObj.templateType === "article" ||
          metaObj.templateType === "landing"
            ? metaObj.templateType
            : undefined,
        game:
          metaObj.game === "pubg" ||
          metaObj.game === "bgmi" ||
          metaObj.game === "freefire" ||
          metaObj.game === "freefire-max" ||
          metaObj.game === "pubg-mobile-codes"
            ? metaObj.game
            : undefined,
        socialTitle: typeof metaObj.socialTitle === "string" ? metaObj.socialTitle : undefined,
        socialDescription:
          typeof metaObj.socialDescription === "string" ? metaObj.socialDescription : undefined,
        socialImageAlt: typeof metaObj.socialImageAlt === "string" ? metaObj.socialImageAlt : undefined,
        keywords: typeof metaObj.keywords === "string" ? metaObj.keywords : undefined,
      },
    };
  }
  return { html: "", meta: {} as PageMeta };
}

export function comparableSlug(input: string) {
  return normalizeSlugInput(input.trim()).toLowerCase();
}

export function comparableTitle(input: string) {
  return input.trim().replace(/\s+/g, " ").toLowerCase();
}
