export type NewsMeta = {
  socialTitle?: string;
  socialDescription?: string;
  socialImageAlt?: string;
  keywords?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function extractNewsHtml(content: unknown) {
  if (typeof content === "string") return content;
  if (isRecord(content) && typeof content.html === "string") return content.html;
  return "";
}

export function extractNewsMeta(content: unknown): NewsMeta {
  if (!isRecord(content)) return {};
  const rawMeta = content.meta;
  if (!isRecord(rawMeta)) return {};
  return {
    socialTitle: typeof rawMeta.socialTitle === "string" ? rawMeta.socialTitle : undefined,
    socialDescription: typeof rawMeta.socialDescription === "string" ? rawMeta.socialDescription : undefined,
    socialImageAlt: typeof rawMeta.socialImageAlt === "string" ? rawMeta.socialImageAlt : undefined,
    keywords: typeof rawMeta.keywords === "string" ? rawMeta.keywords : undefined,
    ogImageUrl: typeof rawMeta.ogImageUrl === "string" ? rawMeta.ogImageUrl : undefined,
    canonicalUrl: typeof rawMeta.canonicalUrl === "string" ? rawMeta.canonicalUrl : undefined,
  };
}
