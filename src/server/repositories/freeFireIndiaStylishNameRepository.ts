import {
  DEFAULT_FREE_FIRE_INDIA_STYLISH_NAME_PAGE,
  FREE_FIRE_INDIA_STYLISH_NAME_SETTINGS_KEY,
  toFreeFireIndiaNamePage,
} from "@/src/lib/freeFireIndiaNamePage";
import type { FreeFireStylishNamePageContent } from "@/src/lib/freeFireStylishNamePage";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";
import {
  getFreeFireStylishNamePageForAdmin,
  normalizeFreeFireStylishNamePage,
} from "@/src/server/repositories/freeFireStylishNameRepository";

const KEY = FREE_FIRE_INDIA_STYLISH_NAME_SETTINGS_KEY;
const READY_KEY = "settings:freeFireIndiaStylishNameReady";

function normalizeIndia(raw: unknown): FreeFireStylishNamePageContent {
  return normalizeFreeFireStylishNamePage(raw, DEFAULT_FREE_FIRE_INDIA_STYLISH_NAME_PAGE);
}

async function readRow(key: string) {
  return tryPrismaLong(async () => prisma.siteSetting.findUnique({ where: { key } }));
}

async function markReady() {
  await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key: READY_KEY },
      create: { key: READY_KEY, value: { ready: true } },
      update: { value: { ready: true } },
    });
    return true;
  });
}

/** One copy of the current Free Fire name page. Nickname values stay as saved. */
async function snapshotFreeFireNamePage(): Promise<FreeFireStylishNamePageContent | null> {
  const ff = await getFreeFireStylishNamePageForAdmin();
  if (ff.usingDefault) return null;
  return toFreeFireIndiaNamePage(ff.page);
}

export async function getFreeFireIndiaStylishNamePage(): Promise<FreeFireStylishNamePageContent> {
  const row = await readRow(KEY);
  if (row?.value) return normalizeIndia(row.value);
  const ready = await readRow(READY_KEY);
  if (ready?.value) return DEFAULT_FREE_FIRE_INDIA_STYLISH_NAME_PAGE;

  const snapshot = await snapshotFreeFireNamePage();
  if (!snapshot) return DEFAULT_FREE_FIRE_INDIA_STYLISH_NAME_PAGE;
  const page = normalizeIndia(snapshot);
  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key: KEY },
      create: { key: KEY, value: page },
      update: { value: page },
    });
    return true;
  });
  if (saved) await markReady();
  return page;
}

export async function getFreeFireIndiaStylishNamePageForAdmin(): Promise<{
  page: FreeFireStylishNamePageContent;
  usingDefault: boolean;
}> {
  const row = await readRow(KEY);
  if (row?.value) return { page: normalizeIndia(row.value), usingDefault: false };
  const ready = await readRow(READY_KEY);
  if (ready?.value) return { page: DEFAULT_FREE_FIRE_INDIA_STYLISH_NAME_PAGE, usingDefault: true };
  const page = await getFreeFireIndiaStylishNamePage();
  const stored = await readRow(KEY);
  return { page, usingDefault: !stored?.value };
}

export async function saveFreeFireIndiaStylishNamePage(
  raw: unknown,
): Promise<{ page: FreeFireStylishNamePageContent; usingDefault: boolean }> {
  const page = normalizeIndia(raw);
  const saved = await tryPrismaLong(async () => {
    await prisma.siteSetting.upsert({
      where: { key: KEY },
      create: { key: KEY, value: page },
      update: { value: page },
    });
    return true;
  });
  if (saved === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  await markReady();
  return { page, usingDefault: false };
}

export async function clearFreeFireIndiaStylishNamePage(): Promise<{
  page: FreeFireStylishNamePageContent;
  usingDefault: boolean;
}> {
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key: KEY } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  await markReady();
  return { page: DEFAULT_FREE_FIRE_INDIA_STYLISH_NAME_PAGE, usingDefault: true };
}
