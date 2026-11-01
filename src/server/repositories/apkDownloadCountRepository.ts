import { FREE_FIRE_INDIA_APK_PAGE_KEY } from "@/src/lib/freeFireIndiaApkPage";
import { prisma, tryPrisma, tryPrismaLong } from "@/src/server/dbSafe";
import { mockStore } from "@/src/server/mockStore";

const ALLOWED_KEYS = new Set<string>([FREE_FIRE_INDIA_APK_PAGE_KEY]);

export function isAllowedApkDownloadPageKey(pageKey: string): boolean {
  return ALLOWED_KEYS.has(pageKey.trim());
}

function settingKey(pageKey: string) {
  return `apkDownloadCount:${pageKey.trim()}`;
}

function parseCount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.floor(value));
  if (value && typeof value === "object" && "count" in value) {
    const raw = (value as { count: unknown }).count;
    if (typeof raw === "number" && Number.isFinite(raw)) return Math.max(0, Math.floor(raw));
  }
  return 0;
}

function ensureMockMap() {
  const store = mockStore as { apkDownloadCounts?: Record<string, number> };
  if (!store.apkDownloadCounts || typeof store.apkDownloadCounts !== "object") {
    store.apkDownloadCounts = {};
  }
  return store.apkDownloadCounts;
}

export async function getApkDownloadCount(pageKey: string): Promise<number> {
  const key = pageKey.trim();
  if (!isAllowedApkDownloadPageKey(key)) return 0;

  const dbCount = await tryPrisma(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: settingKey(key) } });
    return parseCount(row?.value);
  });
  if (dbCount !== null) return dbCount;
  return ensureMockMap()[key] ?? 0;
}

export async function incrementApkDownloadCount(pageKey: string): Promise<number> {
  const key = pageKey.trim();
  if (!isAllowedApkDownloadPageKey(key)) throw new Error("INVALID_PAGE_KEY");

  const dbCount = await tryPrismaLong(async () => {
    const sk = settingKey(key);
    const existing = await prisma.siteSetting.findUnique({ where: { key: sk } });
    const next = parseCount(existing?.value) + 1;
    await prisma.siteSetting.upsert({
      where: { key: sk },
      create: { key: sk, value: { count: next } },
      update: { value: { count: next } },
    });
    return next;
  });
  if (dbCount !== null) return dbCount;

  const map = ensureMockMap();
  map[key] = (map[key] ?? 0) + 1;
  return map[key];
}
