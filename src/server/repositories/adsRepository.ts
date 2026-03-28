import { prisma, tryPrisma } from "@/src/server/dbSafe";
import { mockStore } from "@/src/server/mockStore";

export const DEFAULT_AD_SLOTS = [
  { slotKey: "home_above_calculator", title: "Home — above calculator" },
  { slotKey: "home_between_tool_and_article", title: "Home — between tool & article" },
  { slotKey: "news_list_top", title: "News list — top" },
  { slotKey: "news_list_bottom", title: "News list — bottom" },
  { slotKey: "news_detail_top", title: "News article — below title" },
  { slotKey: "news_detail_mid", title: "News article — below content" },
  { slotKey: "news_detail_bottom", title: "News article — above rating" },
] as const;

export type AdSlotRow = {
  id: string;
  slotKey: string;
  title: string;
  code: string | null;
  isEnabled: boolean;
  updatedAt: Date;
};

async function syncAllDefaultSlots() {
  for (const s of DEFAULT_AD_SLOTS) {
    await prisma.adSlot.upsert({
      where: { slotKey: s.slotKey },
      create: { slotKey: s.slotKey, title: s.title, code: null, isEnabled: false },
      update: {},
    });
  }
}

async function ensureKnownSlot(slotKey: string) {
  const def = DEFAULT_AD_SLOTS.find((s) => s.slotKey === slotKey);
  if (!def) return;
  await prisma.adSlot.upsert({
    where: { slotKey },
    create: { slotKey, title: def.title, code: null, isEnabled: false },
    update: {},
  });
}

export async function listAdSlots(): Promise<AdSlotRow[]> {
  const dbData = await tryPrisma(async () => {
    await syncAllDefaultSlots();
    return prisma.adSlot.findMany({ orderBy: { slotKey: "asc" } });
  });
  if (dbData) {
    return dbData.map((row) => ({
      id: row.id,
      slotKey: row.slotKey,
      title: row.title,
      code: row.code,
      isEnabled: row.isEnabled,
      updatedAt: row.updatedAt,
    }));
  }

  return DEFAULT_AD_SLOTS.map((def) => {
    const found = mockStore.ads.find((a) => a.slotKey === def.slotKey);
    return {
      id: found?.id ?? `mock-${def.slotKey}`,
      slotKey: def.slotKey,
      title: def.title,
      code: found?.code ?? null,
      isEnabled: found?.enabled ?? false,
      updatedAt: new Date(),
    };
  });
}

/** Enabled slot with non-empty code for public pages */
export async function getPublicAdSlot(slotKey: string): Promise<{ html: string } | null> {
  const row = await tryPrisma(async () => {
    await ensureKnownSlot(slotKey);
    return prisma.adSlot.findUnique({
      where: { slotKey },
      select: { code: true, isEnabled: true },
    });
  });

  if (row) {
    if (!row.isEnabled || !row.code?.trim()) return null;
    return { html: row.code.trim() };
  }

  const mock = mockStore.ads.find((a) => a.slotKey === slotKey);
  if (mock?.enabled && mock.code?.trim()) {
    return { html: mock.code.trim() };
  }
  return null;
}

export async function updateAdSlot(input: { id: string; enabled?: boolean; code?: string }) {
  const dbData = await tryPrisma(async () =>
    prisma.adSlot.update({
      where: { id: input.id },
      data: {
        ...(typeof input.enabled === "boolean" ? { isEnabled: input.enabled } : {}),
        ...(typeof input.code === "string" ? { code: input.code } : {}),
      },
    }),
  );
  if (dbData) return dbData;

  const ad = mockStore.ads.find((item) => item.id === input.id);
  if (!ad) return null;
  if (typeof input.enabled === "boolean") ad.enabled = input.enabled;
  if (typeof input.code === "string") ad.code = input.code;
  return {
    id: ad.id,
    slotKey: ad.slotKey,
    title: DEFAULT_AD_SLOTS.find((s) => s.slotKey === ad.slotKey)?.title ?? ad.slotKey,
    code: ad.code ?? null,
    isEnabled: ad.enabled,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
