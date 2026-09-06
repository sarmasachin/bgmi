import { DEFAULT_BGMI_APK_PAGE, type BgmiApkPageContent } from "@/src/lib/bgmiApkPage";
import { normalizeBgmiApkPage } from "@/src/lib/bgmiApkPageNormalize";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";
import { bumpSitemapLastmod } from "@/src/server/repositories/sitemapLastmodRepository";

export const BGMI_APK_SETTING_KEY = "settings:bgmiApkPage";

export async function getBgmiApkPage(): Promise<BgmiApkPageContent> {
  const result = await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: BGMI_APK_SETTING_KEY } });
    return { row };
  });
  if (!result?.row?.value) return DEFAULT_BGMI_APK_PAGE;
  return normalizeBgmiApkPage(result.row.value);
}

export async function getBgmiApkPageForAdmin(): Promise<{
  page: BgmiApkPageContent;
  usingDefault: boolean;
}> {
  const result = await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: BGMI_APK_SETTING_KEY } });
    return { row };
  });
  if (result === null && process.env.DATABASE_URL) {
    throw new Error("DB_UNAVAILABLE");
  }
  if (!result?.row?.value) {
    return { page: DEFAULT_BGMI_APK_PAGE, usingDefault: true };
  }
  return { page: normalizeBgmiApkPage(result.row.value), usingDefault: false };
}

export async function saveBgmiApkPage(
  raw: unknown,
): Promise<{ page: BgmiApkPageContent; usingDefault: boolean }> {
  const page = normalizeBgmiApkPage(raw);
  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key: BGMI_APK_SETTING_KEY },
      create: { key: BGMI_APK_SETTING_KEY, value: page },
      update: { value: page },
    });
    return true;
  });
  if (saved === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(["/bgmi-apk"]);
  return { page, usingDefault: false };
}

export async function clearBgmiApkPage(): Promise<{
  page: BgmiApkPageContent;
  usingDefault: boolean;
}> {
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key: BGMI_APK_SETTING_KEY } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(["/bgmi-apk"]);
  return { page: DEFAULT_BGMI_APK_PAGE, usingDefault: true };
}
