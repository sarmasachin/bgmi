export type AdminNewsRow = {
  id: string;
  title: string;
  status: string;
  slug: string;
  updatedAt?: string;
};

export function mapAdminNewsRows(
  items: Array<{
    id: string;
    title: string;
    status: string;
    slug: string;
    updatedAt?: Date | string | null;
  }>,
): AdminNewsRow[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    status: item.status,
    slug: item.slug,
    updatedAt:
      item.updatedAt instanceof Date
        ? item.updatedAt.toISOString()
        : typeof item.updatedAt === "string"
          ? item.updatedAt
          : "",
  }));
}
