export type AdminNewsRow = {
  id: string;
  title: string;
  status: string;
  slug: string;
  primaryCategory?: string;
  updatedAt?: string;
};

export function mapAdminNewsRows(
  items: Array<{
    id: string;
    title: string;
    status: string;
    slug: string;
    primaryCategory?: string | null;
    updatedAt?: Date | string | null;
  }>,
): AdminNewsRow[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    status: item.status,
    slug: item.slug,
    primaryCategory: item.primaryCategory ?? undefined,
    updatedAt:
      item.updatedAt instanceof Date
        ? item.updatedAt.toISOString()
        : typeof item.updatedAt === "string"
          ? item.updatedAt
          : "",
  }));
}
