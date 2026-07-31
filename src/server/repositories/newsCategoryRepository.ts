import { cache } from "react";
import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";
import {
  DEFAULT_NEWS_CATEGORIES,
  DEFAULT_NEWS_CATEGORY,
  isValidCategorySlugFormat,
  normalizeCategorySlugInput,
  type NewsCategoryDef,
} from "@/src/lib/newsCategories";

export type NewsCategoryRow = NewsCategoryDef & {
  id: string;
  sortOrder: number;
};

function toRow(item: {
  id: string;
  slug: string;
  label: string;
  sortOrder: number;
}): NewsCategoryRow {
  return {
    id: item.id,
    slug: item.slug,
    label: item.label,
    sortOrder: item.sortOrder,
  };
}

async function seedDefaultsIfEmpty() {
  const count = await prisma.newsCategory.count();
  if (count > 0) return;
  await prisma.newsCategory.createMany({
    data: DEFAULT_NEWS_CATEGORIES.map((c, index) => ({
      slug: c.slug,
      label: c.label,
      sortOrder: index,
    })),
  });
}

export const listNewsCategories = cache(async function listNewsCategories(): Promise<
  NewsCategoryRow[]
> {
  const db = await tryPrisma(async () => {
    await seedDefaultsIfEmpty();
    return prisma.newsCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    });
  });
  if (db) return db.map(toRow);
  return DEFAULT_NEWS_CATEGORIES.map((c, index) => ({
    id: `default-${c.slug}`,
    slug: c.slug,
    label: c.label,
    sortOrder: index,
  }));
});

export const listNewsCategorySlugs = cache(async function listNewsCategorySlugs() {
  const rows = await listNewsCategories();
  return rows.map((r) => r.slug);
});

export async function getNewsCategoryBySlug(slug: string) {
  const normalized = normalizeCategorySlugInput(slug);
  if (!normalized) return null;
  const rows = await listNewsCategories();
  return rows.find((r) => r.slug === normalized) ?? null;
}

export async function createNewsCategory(input: { slug: string; label: string }) {
  const slug = normalizeCategorySlugInput(input.slug);
  const label = input.label.trim();
  if (!slug || !isValidCategorySlugFormat(slug)) throw new Error("INVALID_SLUG");
  if (!label) throw new Error("INVALID_LABEL");

  const db = await tryPrismaLong(async () => {
    const exists = await prisma.newsCategory.findUnique({ where: { slug } });
    if (exists) throw new Error("SLUG_EXISTS");
    const max = await prisma.newsCategory.aggregate({ _max: { sortOrder: true } });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;
    return prisma.newsCategory.create({
      data: { slug, label, sortOrder },
    });
  });
  if (db) return toRow(db);
  throw new Error("DB_UNAVAILABLE");
}

export async function updateNewsCategory(input: {
  id: string;
  label: string;
  slug?: string;
}) {
  const label = input.label.trim();
  if (!label) throw new Error("INVALID_LABEL");

  const db = await tryPrismaLong(async () => {
    const existing = await prisma.newsCategory.findUnique({ where: { id: input.id } });
    if (!existing) return null;

    let nextSlug = existing.slug;
    if (input.slug !== undefined) {
      const normalized = normalizeCategorySlugInput(input.slug);
      if (!normalized || !isValidCategorySlugFormat(normalized)) {
        throw new Error("INVALID_SLUG");
      }
      if (normalized !== existing.slug) {
        const clash = await prisma.newsCategory.findUnique({ where: { slug: normalized } });
        if (clash) throw new Error("SLUG_EXISTS");
        // Keep article URLs in sync when slug changes.
        await prisma.newsPost.updateMany({
          where: { primaryCategory: existing.slug },
          data: { primaryCategory: normalized },
        });
        const withExtra = await prisma.newsPost.findMany({
          where: { extraCategories: { has: existing.slug } },
          select: { id: true, extraCategories: true },
        });
        for (const row of withExtra) {
          const nextExtras = row.extraCategories.map((c) =>
            c === existing.slug ? normalized : c,
          );
          await prisma.newsPost.update({
            where: { id: row.id },
            data: { extraCategories: nextExtras },
          });
        }
        nextSlug = normalized;
      }
    }

    return prisma.newsCategory.update({
      where: { id: input.id },
      data: { label, slug: nextSlug },
    });
  });
  if (db === null) return null;
  if (db) return toRow(db);
  throw new Error("DB_UNAVAILABLE");
}

export async function deleteNewsCategory(id: string) {
  const db = await tryPrismaLong(async () => {
    const existing = await prisma.newsCategory.findUnique({ where: { id } });
    if (!existing) return { ok: false as const, reason: "NOT_FOUND" as const };

    const usedAsPrimary = await prisma.newsPost.count({
      where: { primaryCategory: existing.slug },
    });
    if (usedAsPrimary > 0) {
      return { ok: false as const, reason: "IN_USE_PRIMARY" as const, slug: existing.slug };
    }
    const usedAsExtra = await prisma.newsPost.count({
      where: { extraCategories: { has: existing.slug } },
    });
    if (usedAsExtra > 0) {
      return { ok: false as const, reason: "IN_USE_EXTRA" as const, slug: existing.slug };
    }

    // Keep at least one category.
    const total = await prisma.newsCategory.count();
    if (total <= 1) {
      return { ok: false as const, reason: "LAST_CATEGORY" as const };
    }
    if (existing.slug === DEFAULT_NEWS_CATEGORY) {
      // Allow delete of default only if another category exists; posts already blocked above.
    }

    await prisma.newsCategory.delete({ where: { id } });
    return { ok: true as const, slug: existing.slug };
  });

  if (db) return db;
  throw new Error("DB_UNAVAILABLE");
}
