type TemplateType = "home" | "article" | "landing";

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
  socialTitle?: string;
  socialDescription?: string;
  socialImageAlt?: string;
};

type PageMeta = {
  templateType?: TemplateType;
  socialTitle?: string;
  socialDescription?: string;
  socialImageAlt?: string;
};

function coerceTemplateType(value: unknown): TemplateType {
  return value === "article" || value === "landing" || value === "home" ? value : "home";
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
            socialTitle?: unknown;
            socialDescription?: unknown;
            socialImageAlt?: unknown;
          })
        : {};
    return {
      html: typeof maybeHtml === "string" ? maybeHtml : "",
      meta: {
        templateType:
          metaObj.templateType === "home" || metaObj.templateType === "article" || metaObj.templateType === "landing"
            ? metaObj.templateType
            : undefined,
        socialTitle: typeof metaObj.socialTitle === "string" ? metaObj.socialTitle : undefined,
        socialDescription: typeof metaObj.socialDescription === "string" ? metaObj.socialDescription : undefined,
        socialImageAlt: typeof metaObj.socialImageAlt === "string" ? metaObj.socialImageAlt : undefined,
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
      socialTitle: parsed.meta.socialTitle ?? "",
      socialDescription: parsed.meta.socialDescription ?? "",
      socialImageAlt: parsed.meta.socialImageAlt ?? "",
    };
  });
}
