import {
  DEFAULT_PUBG_MOBILE_LITE_APK_PAGE,
  type PubgMobileLiteApkPageContent,
} from "@/src/lib/pubgMobileLiteApkPage";
import { normalizePubgMobileLiteApkPage } from "@/src/lib/pubgMobileLiteApkPageNormalize";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";
import { bumpSitemapLastmod } from "@/src/server/repositories/sitemapLastmodRepository";

export const PUBG_MOBILE_LITE_APK_SETTING_KEY = "settings:pubgMobileLiteApkPage";

export async function getPubgMobileLiteApkPage(): Promise<PubgMobileLiteApkPageContent> {
  const result = await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({
      where: { key: PUBG_MOBILE_LITE_APK_SETTING_KEY },
    });
    return { row };
  });
  if (!result?.row?.value) return DEFAULT_PUBG_MOBILE_LITE_APK_PAGE;
  return normalizePubgMobileLiteApkPage(result.row.value);
}

export async function getPubgMobileLiteApkPageForAdmin(): Promise<{
  page: PubgMobileLiteApkPageContent;
  usingDefault: boolean;
}> {
  const result = await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({
      where: { key: PUBG_MOBILE_LITE_APK_SETTING_KEY },
    });
    return { row };
  });
  if (result === null && process.env.DATABASE_URL) {
    throw new Error("DB_UNAVAILABLE");
  }
  if (!result?.row?.value) {
    return { page: DEFAULT_PUBG_MOBILE_LITE_APK_PAGE, usingDefault: true };
  }
  return { page: normalizePubgMobileLiteApkPage(result.row.value), usingDefault: false };
}

export async function savePubgMobileLiteApkPage(
  raw: unknown,
): Promise<{ page: PubgMobileLiteApkPageContent; usingDefault: boolean }> {
  const page = normalizePubgMobileLiteApkPage(raw);
  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key: PUBG_MOBILE_LITE_APK_SETTING_KEY },
      create: { key: PUBG_MOBILE_LITE_APK_SETTING_KEY, value: page },
      update: { value: page },
    });
    return true;
  });
  if (saved === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(["/pubg-mobile-lite-apk"]);
  return { page, usingDefault: false };
}

export async function clearPubgMobileLiteApkPage(): Promise<{
  page: PubgMobileLiteApkPageContent;
  usingDefault: boolean;
}> {
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key: PUBG_MOBILE_LITE_APK_SETTING_KEY } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(["/pubg-mobile-lite-apk"]);
  return { page: DEFAULT_PUBG_MOBILE_LITE_APK_PAGE, usingDefault: true };
}
