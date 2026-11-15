import { mockStore } from "@/src/server/mockStore";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";

function toUpdatedAt(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date(0);
}

/** Published CMS pages for sitemap (excludes home slug "/"). */
export async function listPublishedPagesForSitemap(): Promise<
  Array<{ slug: string; updatedAt: Date }>
> {
  const dbData = await tryPrismaLong(async () =>
    prisma.pageTemplate.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  );

  const rows: Array<{ slug: string; updatedAt: Date }> = dbData
    ? dbData.map((row) => ({
        slug: row.slug,
        updatedAt: row.updatedAt,
      }))
    : mockStore.pages
        .filter((page) => page.status === "published")
        .map((row) => ({
          slug: row.slug,
          updatedAt: toUpdatedAt(row.updatedAt),
        }))
        .filter((row) => row.updatedAt.getTime() > 0);

  return rows.filter((row) => {
    const slug = (row.slug || "").trim();
    return Boolean(slug) && slug !== "/";
  });
}
