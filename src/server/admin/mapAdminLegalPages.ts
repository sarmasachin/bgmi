export type AdminLegalPageRow = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  seoTitle: string;
  seoDescription: string;
  contentHtml: string;
  updatedAt: string;
};

function asStatus(value: unknown): AdminLegalPageRow["status"] {
  return value === "published" ? "published" : "draft";
}

function extractHtml(content: unknown) {
  if (typeof content === "string") return content;
  if (content && typeof content === "object" && "html" in content) {
    const html = (content as { html?: unknown }).html;
    return typeof html === "string" ? html : "";
  }
  return "";
}

export function mapAdminLegalPages(
  items: Array<{
    id: string;
    title: string;
    slug: string;
    status?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    content?: unknown;
    updatedAt?: Date | string | null;
  }>,
): AdminLegalPageRow[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    status: asStatus(item.status),
    seoTitle: item.seoTitle?.trim() || "",
    seoDescription: item.seoDescription?.trim() || "",
    contentHtml: extractHtml(item.content),
    updatedAt:
      item.updatedAt instanceof Date
        ? item.updatedAt.toISOString()
        : typeof item.updatedAt === "string"
          ? item.updatedAt
          : "",
  }));
}
