import {
  normalizeSitemapPath,
  SITEMAP_PATH_CONTENT_KEYS,
  SITEMAP_STATIC_PATHS,
} from "@/src/lib/sitemapLastmod";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";

const KEY = "settings:sitemapLastmod";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseMap(raw: unknown): Record<string, string> {
  if (!isPlainObject(raw)) return {};
  const out: Record<string, string> = {};
  for (const [path, value] of Object.entries(raw)) {
    if (typeof value !== "string" || !value.trim()) continue;
    const normalized = normalizeSitemapPath(path);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) continue;
    out[normalized] = date.toISOString();
  }
  return out;
}

function maxDate(dates: Date[]): Date | null {
  let best: Date | null = null;
  for (const date of dates) {
    if (Number.isNaN(date.getTime())) continue;
    if (!best || date.getTime() > best.getTime()) best = date;
  }
  return best;
}

/** Kept for admin save hooks; sitemap lastmod itself uses content updatedAt only. */
export async function touchSitemapLastmod(paths: string[]): Promise<void> {
  const unique = [
    ...new Set(
      paths
        .map((path) => normalizeSitemapPath(path))
        .filter((path) => path.length > 0),
    ),
  ];
  if (!unique.length) return;

  const now = new Date().toISOString();
  await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: KEY } });
    const prev = parseMap(row?.value);
    const next = { ...prev };
    for (const path of unique) next[path] = now;
    await prisma.siteSetting.upsert({
      where: { key: KEY },
      create: { key: KEY, value: next },
      update: { value: next },
    });
    return true;
  });
}

export function bumpSitemapLastmod(paths: string[]): void {
  void touchSitemapLastmod(paths).catch(() => {
    /* ignore */
  });
}

/**
 * lastmod per static URL = that page's own content `updatedAt` in DB.
 * Does not stamp "now" on sitemap generate, and does not use old publishedAt.
 */
export async function getSitemapLastmodMap(): Promise<Map<string, Date>> {
  const allKeys = [...new Set(Object.values(SITEMAP_PATH_CONTENT_KEYS).flat())];

  const [settingRows, legalRows] = await Promise.all([
    tryPrismaLong(async () =>
      prisma.siteSetting.findMany({
        where: { key: { in: allKeys } },
        select: { key: true, updatedAt: true },
      }),
    ),
    tryPrismaLong(async () =>
      prisma.legalPage.findMany({
        where: { slug: { in: ["privacy", "terms", "disclaimer"] } },
        select: { slug: true, updatedAt: true },
      }),
    ),
  ]);

  const keyToDate = new Map<string, Date>();
  for (const row of settingRows ?? []) {
    keyToDate.set(row.key, row.updatedAt);
  }

  const out = new Map<string, Date>();
  for (const path of SITEMAP_STATIC_PATHS) {
    const keys = SITEMAP_PATH_CONTENT_KEYS[path] ?? [];
    const dates = keys
      .map((key) => keyToDate.get(key))
      .filter((value): value is Date => value instanceof Date);
    const best = maxDate(dates);
    if (best) out.set(path, best);
  }

  for (const row of legalRows ?? []) {
    const path = `/${row.slug}`;
    const prev = out.get(path);
    if (!prev || row.updatedAt.getTime() > prev.getTime()) {
      out.set(path, row.updatedAt);
    }
  }

  return out;
}

export function resolveSitemapLastmod(
  map: Map<string, Date>,
  path: string,
): Date | undefined {
  return map.get(normalizeSitemapPath(path));
}
