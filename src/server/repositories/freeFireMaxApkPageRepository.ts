import { DEFAULT_FREE_FIRE_MAX_APK_PAGE, type FreeFireMaxApkPageContent } from "@/src/lib/freeFireMaxApkPage";
import { normalizeFreeFireMaxApkPage } from "@/src/lib/freeFireMaxApkPageNormalize";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";
import { bumpSitemapLastmod } from "@/src/server/repositories/sitemapLastmodRepository";

export const FREE_FIRE_MAX_APK_SETTING_KEY = "settings:freeFireMaxApkPage";

export async function getFreeFireMaxApkPage(): Promise<FreeFireMaxApkPageContent> {
  const result = await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: FREE_FIRE_MAX_APK_SETTING_KEY } });
    return { row };
  });
  if (!result?.row?.value) return DEFAULT_FREE_FIRE_MAX_APK_PAGE;
  return normalizeFreeFireMaxApkPage(result.row.value);
}

export async function getFreeFireMaxApkPageForAdmin(): Promise<{
  page: FreeFireMaxApkPageContent;
  usingDefault: boolean;
}> {
  const result = await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: FREE_FIRE_MAX_APK_SETTING_KEY } });
    return { row };
  });
  if (result === null && process.env.DATABASE_URL) {
    throw new Error("DB_UNAVAILABLE");
  }
  if (!result?.row?.value) {
    return { page: DEFAULT_FREE_FIRE_MAX_APK_PAGE, usingDefault: true };
  }
  return { page: normalizeFreeFireMaxApkPage(result.row.value), usingDefault: false };
}

export async function saveFreeFireMaxApkPage(
  raw: unknown,
): Promise<{ page: FreeFireMaxApkPageContent; usingDefault: boolean }> {
  const page = normalizeFreeFireMaxApkPage(raw);
  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key: FREE_FIRE_MAX_APK_SETTING_KEY },
      create: { key: FREE_FIRE_MAX_APK_SETTING_KEY, value: page },
      update: { value: page },
    });
    return true;
  });
  if (saved === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(["/free-fire-max-apk"]);
  return { page, usingDefault: false };
}

export async function clearFreeFireMaxApkPage(): Promise<{
  page: FreeFireMaxApkPageContent;
  usingDefault: boolean;
}> {
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key: FREE_FIRE_MAX_APK_SETTING_KEY } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(["/free-fire-max-apk"]);
  return { page: DEFAULT_FREE_FIRE_MAX_APK_PAGE, usingDefault: true };
}
