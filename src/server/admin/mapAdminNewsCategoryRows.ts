export type AdminNewsCategoryRow = {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
};

export function mapAdminNewsCategoryRows(
  items: Array<{ id: string; slug: string; label: string; sortOrder: number }>,
): AdminNewsCategoryRow[] {
  return items.map((item) => ({
    id: item.id,
    slug: item.slug,
    label: item.label,
    sortOrder: item.sortOrder,
  }));
}
