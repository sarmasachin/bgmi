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

/** Record that admin updated these public paths (sitemap lastmod). */
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

/** Safe fire-and-forget bump — never fails the parent admin save. */
export function bumpSitemapLastmod(paths: string[]): void {
  void touchSitemapLastmod(paths).catch(() => {
    /* ignore */
  });
}

async function loadContentLastmods(): Promise<Map<string, Date>> {
  const map = new Map<string, Date>();
  const allKeys = [...new Set(Object.values(SITEMAP_PATH_CONTENT_KEYS).flat())];

  const [settingRows, legalRows, latestNews] = await Promise.all([
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
    tryPrismaLong(async () =>
      prisma.newsPost.findFirst({
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ),
  ]);

  const keyToDate = new Map<string, Date>();
  for (const row of settingRows ?? []) {
    keyToDate.set(row.key, row.updatedAt);
  }

  for (const [path, keys] of Object.entries(SITEMAP_PATH_CONTENT_KEYS)) {
    const dates = keys
      .map((key) => keyToDate.get(key))
      .filter((value): value is Date => value instanceof Date);
    const best = maxDate(dates);
    if (best) map.set(path, best);
  }

  for (const row of legalRows ?? []) {
    const path = `/${row.slug}`;
    const prev = map.get(path);
    if (!prev || row.updatedAt.getTime() > prev.getTime()) {
      map.set(path, row.updatedAt);
    }
  }

  if (latestNews?.updatedAt) {
    const prev = map.get("/news");
    if (!prev || latestNews.updatedAt.getTime() > prev.getTime()) {
      map.set("/news", latestNews.updatedAt);
    }
  }

  return map;
}

/**
 * Effective lastmod per static path = newest of:
 * - admin touch timestamp
 * - real content `updatedAt` in DB (Page Cards, articles, FAQs, legal, news, …)
 * Never uses a fake fixed calendar date like 2026-01-01.
 */
export async function getSitemapLastmodMap(): Promise<Map<string, Date>> {
  const [touchRow, contentMap] = await Promise.all([
    tryPrismaLong(async () => prisma.siteSetting.findUnique({ where: { key: KEY } })),
    loadContentLastmods(),
  ]);

  const touchMap = parseMap(touchRow?.value);
  const out = new Map<string, Date>();

  for (const path of SITEMAP_STATIC_PATHS) {
    const candidates: Date[] = [];
    const touchIso = touchMap[path];
    if (touchIso) {
      const touchDate = new Date(touchIso);
      if (!Number.isNaN(touchDate.getTime())) candidates.push(touchDate);
    }
    const contentDate = contentMap.get(path);
    if (contentDate) candidates.push(contentDate);
    const best = maxDate(candidates);
    if (best) out.set(path, best);
  }

  return out;
}

/** Returns undefined when no real update history exists yet. */
export function resolveSitemapLastmod(
  map: Map<string, Date>,
  path: string,
): Date | undefined {
  return map.get(normalizeSitemapPath(path));
}
