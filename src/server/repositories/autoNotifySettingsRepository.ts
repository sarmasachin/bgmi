import { prisma, tryPrisma } from "@/src/server/dbSafe";
import {
  DEFAULT_AUTO_NOTIFY_SETTINGS,
  parseAutoNotifySettings,
  type AutoNotifySettings,
} from "@/src/lib/autoNotifySettings";

const KEY = "settings:autoNotify";

export type { AutoNotifySettings };

export async function getAutoNotifySettings(): Promise<AutoNotifySettings> {
  const row = await tryPrisma(async () =>
    prisma.siteSetting.findUnique({ where: { key: KEY } }),
  );
  if (!row) return { ...DEFAULT_AUTO_NOTIFY_SETTINGS };
  return parseAutoNotifySettings(row.value);
}

export async function saveAutoNotifySettings(
  input: Partial<AutoNotifySettings>,
): Promise<AutoNotifySettings> {
  const current = await getAutoNotifySettings();
  const next: AutoNotifySettings = {
    newsOnPublish:
      typeof input.newsOnPublish === "boolean" ? input.newsOnPublish : current.newsOnPublish,
    pagesOnPublish:
      typeof input.pagesOnPublish === "boolean" ? input.pagesOnPublish : current.pagesOnPublish,
    redeemOnSave:
      typeof input.redeemOnSave === "boolean" ? input.redeemOnSave : current.redeemOnSave,
    advanceServerOnSave:
      typeof input.advanceServerOnSave === "boolean"
        ? input.advanceServerOnSave
        : current.advanceServerOnSave,
    stylishNamesOnSave:
      typeof input.stylishNamesOnSave === "boolean"
        ? input.stylishNamesOnSave
        : current.stylishNamesOnSave,
    liteApkOnSave:
      typeof input.liteApkOnSave === "boolean" ? input.liteApkOnSave : current.liteApkOnSave,
  };

  await prisma.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: next },
    update: { value: next },
  });

  return next;
}
