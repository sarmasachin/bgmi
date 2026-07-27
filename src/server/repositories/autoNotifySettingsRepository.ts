import { prisma, tryPrisma } from "@/src/server/dbSafe";

const KEY = "settings:autoNotify";

export type AutoNotifySettings = {
  /** Send push when a news post is published. */
  newsOnPublish: boolean;
  /** Send push when a page/clone is published. */
  pagesOnPublish: boolean;
};

const DEFAULTS: AutoNotifySettings = {
  newsOnPublish: false,
  pagesOnPublish: false,
};

function parse(raw: unknown): AutoNotifySettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULTS };
  const o = raw as Record<string, unknown>;
  return {
    newsOnPublish: o.newsOnPublish === true,
    pagesOnPublish: o.pagesOnPublish === true,
  };
}

export async function getAutoNotifySettings(): Promise<AutoNotifySettings> {
  const row = await tryPrisma(async () =>
    prisma.siteSetting.findUnique({ where: { key: KEY } }),
  );
  if (!row) return { ...DEFAULTS };
  return parse(row.value);
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
  };

  await prisma.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: next },
    update: { value: next },
  });

  return next;
}
