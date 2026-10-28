import { DEFAULT_FREE_FIRE_APK_PAGE, type FreeFireApkPageContent } from "@/src/lib/freeFireApkPage";
import { normalizeFreeFireApkPage } from "@/src/lib/freeFireApkPageNormalize";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";
import { bumpSitemapLastmod } from "@/src/server/repositories/sitemapLastmodRepository";

export const FREE_FIRE_APK_SETTING_KEY = "settings:freeFireApkPage";

export async function getFreeFireApkPage(): Promise<FreeFireApkPageContent> {
  const result = await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: FREE_FIRE_APK_SETTING_KEY } });
    return { row };
  });
  if (!result?.row?.value) return DEFAULT_FREE_FIRE_APK_PAGE;
  return normalizeFreeFireApkPage(result.row.value);
}

export async function getFreeFireApkPageForAdmin(): Promise<{
  page: FreeFireApkPageContent;
  usingDefault: boolean;
}> {
  const result = await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: FREE_FIRE_APK_SETTING_KEY } });
    return { row };
  });
  if (result === null && process.env.DATABASE_URL) {
    throw new Error("DB_UNAVAILABLE");
  }
  if (!result?.row?.value) {
    return { page: DEFAULT_FREE_FIRE_APK_PAGE, usingDefault: true };
  }
  return { page: normalizeFreeFireApkPage(result.row.value), usingDefault: false };
}

export async function saveFreeFireApkPage(
  raw: unknown,
): Promise<{ page: FreeFireApkPageContent; usingDefault: boolean }> {
  const page = normalizeFreeFireApkPage(raw);
  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key: FREE_FIRE_APK_SETTING_KEY },
      create: { key: FREE_FIRE_APK_SETTING_KEY, value: page },
      update: { value: page },
    });
    return true;
  });
  if (saved === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(["/free-fire-apk", "/free-fire-india-apk"]);
  return { page, usingDefault: false };
}

export async function clearFreeFireApkPage(): Promise<{
  page: FreeFireApkPageContent;
  usingDefault: boolean;
}> {
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key: FREE_FIRE_APK_SETTING_KEY } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(["/free-fire-apk", "/free-fire-india-apk"]);
  return { page: DEFAULT_FREE_FIRE_APK_PAGE, usingDefault: true };
}
