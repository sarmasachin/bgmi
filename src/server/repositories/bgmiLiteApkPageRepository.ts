import { DEFAULT_BGMI_LITE_APK_PAGE, type BgmiLiteBetaApkPageContent } from "@/src/lib/bgmiLiteBetaApkPage";
import { normalizeBgmiLiteApkPage } from "@/src/lib/bgmiLiteApkPageNormalize";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";
import { bumpSitemapLastmod } from "@/src/server/repositories/sitemapLastmodRepository";

export const BGMI_LITE_APK_SETTING_KEY = "settings:bgmiLiteApkPage";

export async function getBgmiLiteApkPage(): Promise<BgmiLiteBetaApkPageContent> {
  const result = await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: BGMI_LITE_APK_SETTING_KEY } });
    return { row };
  });
  if (!result?.row?.value) return DEFAULT_BGMI_LITE_APK_PAGE;
  return normalizeBgmiLiteApkPage(result.row.value);
}

export async function getBgmiLiteApkPageForAdmin(): Promise<{
  page: BgmiLiteBetaApkPageContent;
  usingDefault: boolean;
}> {
  const result = await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: BGMI_LITE_APK_SETTING_KEY } });
    return { row };
  });
  if (result === null && process.env.DATABASE_URL) {
    throw new Error("DB_UNAVAILABLE");
  }
  if (!result?.row?.value) {
    return { page: DEFAULT_BGMI_LITE_APK_PAGE, usingDefault: true };
  }
  return { page: normalizeBgmiLiteApkPage(result.row.value), usingDefault: false };
}

export async function saveBgmiLiteApkPage(
  raw: unknown,
): Promise<{ page: BgmiLiteBetaApkPageContent; usingDefault: boolean }> {
  const page = normalizeBgmiLiteApkPage(raw);
  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key: BGMI_LITE_APK_SETTING_KEY },
      create: { key: BGMI_LITE_APK_SETTING_KEY, value: page },
      update: { value: page },
    });
    return true;
  });
  if (saved === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(["/bgmi-lite-apk"]);
  return { page, usingDefault: false };
}

export async function clearBgmiLiteApkPage(): Promise<{
  page: BgmiLiteBetaApkPageContent;
  usingDefault: boolean;
}> {
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key: BGMI_LITE_APK_SETTING_KEY } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(["/bgmi-lite-apk"]);
  return { page: DEFAULT_BGMI_LITE_APK_PAGE, usingDefault: true };
}
