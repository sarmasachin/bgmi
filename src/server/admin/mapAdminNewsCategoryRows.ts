export type AdminNewsCategoryRow = {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
};

export function mapAdminNewsCategoryRows(
  items: Array<{
    id: string;
    slug: string;
    label: string;
    sortOrder: number;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string | null;
  }>,
): AdminNewsCategoryRow[] {
  return items.map((item) => ({
    id: item.id,
    slug: item.slug,
    label: item.label,
    sortOrder: item.sortOrder,
    seoTitle: (item.seoTitle ?? "").trim(),
    seoDescription: (item.seoDescription ?? "").trim(),
    seoKeywords: (item.seoKeywords ?? "").trim(),
  }));
}
