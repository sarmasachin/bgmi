import { DEFAULT_GTA6_PAGE } from "@/src/lib/gta6PageDefaults";
import { normalizeGta6Page } from "@/src/lib/gta6PageNormalize";
import type { Gta6PageContent } from "@/src/lib/gta6PageTypes";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";
import { bumpSitemapLastmod } from "@/src/server/repositories/sitemapLastmodRepository";

export const GTA6_PAGE_SETTING_KEY = "settings:gta6Page";

const PATHS = [
  "/gta-6-sensitivity-settings-calculator",
  "/gta-6-cheat-code",
  "/gta-6-apk",
];

export async function getGta6Page(): Promise<Gta6PageContent> {
  const result = await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: GTA6_PAGE_SETTING_KEY } });
    return { row };
  });
  if (!result?.row?.value) return DEFAULT_GTA6_PAGE;
  return normalizeGta6Page(result.row.value);
}

export async function getGta6PageForAdmin(): Promise<{
  page: Gta6PageContent;
  usingDefault: boolean;
}> {
  const result = await tryPrismaLong(async () => {
    const row = await prisma.siteSetting.findUnique({ where: { key: GTA6_PAGE_SETTING_KEY } });
    return { row };
  });
  if (result === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  if (!result?.row?.value) return { page: DEFAULT_GTA6_PAGE, usingDefault: true };
  return { page: normalizeGta6Page(result.row.value), usingDefault: false };
}

export async function saveGta6Page(
  raw: unknown,
): Promise<{ page: Gta6PageContent; usingDefault: boolean }> {
  const page = normalizeGta6Page(raw);
  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key: GTA6_PAGE_SETTING_KEY },
      create: { key: GTA6_PAGE_SETTING_KEY, value: page },
      update: { value: page },
    });
    return true;
  });
  if (saved === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(PATHS);
  return { page, usingDefault: false };
}

export async function clearGta6Page(): Promise<{
  page: Gta6PageContent;
  usingDefault: boolean;
}> {
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key: GTA6_PAGE_SETTING_KEY } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  bumpSitemapLastmod(PATHS);
  return { page: DEFAULT_GTA6_PAGE, usingDefault: true };
}
