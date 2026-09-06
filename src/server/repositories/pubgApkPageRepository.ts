import { DEFAULT_PUBG_APK_PAGE, type PubgApkPageContent } from "@/src/lib/pubgApkPage";
import { normalizePubgApkPage } from "@/src/lib/pubgApkPageNormalize";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";
import { bumpSitemapLastmod } from "@/src/server/repositories/sitemapLastmodRepository";

export const PUBG_APK_SETTING_KEY = "settings:pubgApkPage";

export async function getPubgApkPage(): Promise<PubgApkPageContent> {
  const result = await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: PUBG_APK_SETTING_KEY } });
    return { row };
  });
  if (!result?.row?.value) return DEFAULT_PUBG_APK_PAGE;
  return normalizePubgApkPage(result.row.value);
}

export async function getPubgApkPageForAdmin(): Promise<{
  page: PubgApkPageContent;
  usingDefault: boolean;
}> {
  const result = await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: PUBG_APK_SETTING_KEY } });
    return { row };
  });
  if (result === null && process.env.DATABASE_URL) {
    throw new Error("DB_UNAVAILABLE");
  }
  if (!result?.row?.value) {
    return { page: DEFAULT_PUBG_APK_PAGE, usingDefault: true };
  }
  return { page: normalizePubgApkPage(result.row.value), usingDefault: false };
}

export async function savePubgApkPage(
  raw: unknown,
): Promise<{ page: PubgApkPageContent; usingDefault: boolean }> {
  const page = normalizePubgApkPage(raw);
  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key: PUBG_APK_SETTING_KEY },
      create: { key: PUBG_APK_SETTING_KEY, value: page },
      update: { value: page },
    });
    return true;
  });
  if (saved === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(["/pubg-apk"]);
  return { page, usingDefault: false };
}

export async function clearPubgApkPage(): Promise<{
  page: PubgApkPageContent;
  usingDefault: boolean;
}> {
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key: PUBG_APK_SETTING_KEY } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(["/pubg-apk"]);
  return { page: DEFAULT_PUBG_APK_PAGE, usingDefault: true };
}
