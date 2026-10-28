import { coerceFreeFireRedeemServer } from "@/src/lib/freeFireRedeemServers";
import {
  DEFAULT_FREE_FIRE_INDIA_REDEEM_PAGE,
  FREE_FIRE_INDIA_REDEEM_SETTINGS_KEY,
  toFreeFireIndiaRedeemPage,
} from "@/src/lib/freeFireIndiaRedeemPage";
import type { FreeFireRedeemCodePageContent } from "@/src/lib/freeFireRedeemCodes";
import { prisma, tryPrismaLong } from "@/src/server/dbSafe";
import {
  getFreeFireRedeemPageForAdmin,
  normalizeFreeFireRedeemPage,
} from "@/src/server/repositories/freeFireRedeemCodesRepository";

const KEY = FREE_FIRE_INDIA_REDEEM_SETTINGS_KEY;
const READY_KEY = "settings:freeFireIndiaRedeemCodesReady";

function normalizeIndia(raw: unknown): FreeFireRedeemCodePageContent {
  return normalizeFreeFireRedeemPage(raw, DEFAULT_FREE_FIRE_INDIA_REDEEM_PAGE);
}

/** Codes the India page already showed: Free Fire rows tagged server "india". */
async function snapshotVisibleIndiaPage(): Promise<FreeFireRedeemCodePageContent | null> {
  const ff = await getFreeFireRedeemPageForAdmin();
  if (ff.usingDefault) return null;
  const copy = toFreeFireIndiaRedeemPage(ff.page);
  return {
    ...copy,
    codes: copy.codes.filter(
      (code) => coerceFreeFireRedeemServer(code.server, copy.servers) === "india",
    ),
  };
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

export async function getFreeFireIndiaRedeemPage(): Promise<FreeFireRedeemCodePageContent> {
  const row = await readRow(KEY);
  if (row?.value) return normalizeIndia(row.value);
  const ready = await readRow(READY_KEY);
  if (ready?.value) return DEFAULT_FREE_FIRE_INDIA_REDEEM_PAGE;

  const snapshot = await snapshotVisibleIndiaPage();
  if (!snapshot) return DEFAULT_FREE_FIRE_INDIA_REDEEM_PAGE;
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

export async function getFreeFireIndiaRedeemUpdatedAt(): Promise<Date | null> {
  const row = await tryPrismaLong(async () =>
    prisma.siteSetting.findUnique({
      where: { key: KEY },
      select: { updatedAt: true },
    }),
  );
  return row?.updatedAt ?? null;
}

export async function getFreeFireIndiaRedeemPageForAdmin(): Promise<{
  page: FreeFireRedeemCodePageContent;
  usingDefault: boolean;
}> {
  const row = await readRow(KEY);
  if (row?.value) return { page: normalizeIndia(row.value), usingDefault: false };
  const ready = await readRow(READY_KEY);
  if (ready?.value) return { page: DEFAULT_FREE_FIRE_INDIA_REDEEM_PAGE, usingDefault: true };
  const page = await getFreeFireIndiaRedeemPage();
  const stored = await readRow(KEY);
  return { page, usingDefault: !stored?.value };
}

export async function saveFreeFireIndiaRedeemPage(
  raw: unknown,
): Promise<{ page: FreeFireRedeemCodePageContent; usingDefault: boolean }> {
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

export async function clearFreeFireIndiaRedeemPage(): Promise<{
  page: FreeFireRedeemCodePageContent;
  usingDefault: boolean;
}> {
  const deleted = await tryPrismaLong(async () => {
    await prisma.siteSetting.deleteMany({ where: { key: KEY } });
    return true;
  });
  if (deleted === null && process.env.DATABASE_URL) throw new Error("DB_UNAVAILABLE");
  await markReady();
  return { page: DEFAULT_FREE_FIRE_INDIA_REDEEM_PAGE, usingDefault: true };
}
