type TemplateType = "home" | "article" | "landing";
export type CloneGame = "bgmi" | "pubg";

export type AdminPageRow = {
  id: string;
  title: string;
  status: string;
  slug: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  contentHtml?: string;
  templateType: TemplateType;
  /** Calculator game for home-style clones. Defaults to bgmi when missing. */
  game: CloneGame;
  socialTitle?: string;
  socialDescription?: string;
  socialImageAlt?: string;
  metaKeywords?: string;
};

type PageMeta = {
  templateType?: TemplateType;
  game?: CloneGame;
  socialTitle?: string;
  socialDescription?: string;
  socialImageAlt?: string;
  keywords?: string;
};

function coerceTemplateType(value: unknown): TemplateType {
  return value === "article" || value === "landing" || value === "home" ? value : "home";
}

function coerceCloneGame(value: unknown): CloneGame {
  return value === "pubg" ? "pubg" : "bgmi";
}

function parseContent(content: unknown) {
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
          metaObj.templateType === "home" || metaObj.templateType === "article" || metaObj.templateType === "landing"
            ? metaObj.templateType
            : undefined,
        game: metaObj.game === "pubg" || metaObj.game === "bgmi" ? metaObj.game : undefined,
        socialTitle: typeof metaObj.socialTitle === "string" ? metaObj.socialTitle : undefined,
        socialDescription: typeof metaObj.socialDescription === "string" ? metaObj.socialDescription : undefined,
        socialImageAlt: typeof metaObj.socialImageAlt === "string" ? metaObj.socialImageAlt : undefined,
        keywords: typeof metaObj.keywords === "string" ? metaObj.keywords : undefined,
      },
    };
  }
  return { html: "", meta: {} as PageMeta };
}

export function mapAdminPageRows(
  pages: Array<{
    id: string;
    title: string;
    status: string;
    slug: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
    canonicalUrl?: string | null;
    ogImageUrl?: string | null;
    content?: unknown;
  }>,
): AdminPageRow[] {
  return pages.map((item) => {
    const parsed = parseContent(item.content);
    return {
      id: item.id,
      title: item.title,
      status: item.status,
      slug: item.slug,
      seoTitle: item.seoTitle ?? "",
      seoDescription: item.seoDescription ?? "",
      canonicalUrl: item.canonicalUrl ?? "",
      ogImageUrl: item.ogImageUrl ?? "",
      contentHtml: parsed.html,
      templateType: coerceTemplateType(parsed.meta.templateType),
      game: coerceCloneGame(parsed.meta.game),
      socialTitle: parsed.meta.socialTitle ?? "",
      socialDescription: parsed.meta.socialDescription ?? "",
      socialImageAlt: parsed.meta.socialImageAlt ?? "",
      metaKeywords: parsed.meta.keywords ?? "",
    };
  });
}
