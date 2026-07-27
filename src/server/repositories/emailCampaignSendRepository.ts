import { prisma, tryPrisma } from "@/src/server/dbSafe";

const KEY = "settings:emailCampaign";

export type EmailCampaignSettings = {
  /** Max successful campaign emails per UTC day. */
  dailySendLimit: number;
};

const DEFAULTS: EmailCampaignSettings = {
  dailySendLimit: 950,
};

/** Spread daily quota evenly across 24h (950/day → ~90.95s between emails ≈ 0.66/min). */
export function emailSendIntervalMs(dailySendLimit: number): number {
  const limit = Math.max(1, Math.floor(dailySendLimit));
  return Math.round((24 * 60 * 60 * 1000) / limit);
}

export function emailsPerMinuteFromDailyLimit(dailySendLimit: number): number {
  const limit = Math.max(1, Math.floor(dailySendLimit));
  return limit / (24 * 60);
}

function clampDailyLimit(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return DEFAULTS.dailySendLimit;
  return Math.min(5000, Math.max(1, Math.floor(n)));
}

function parse(raw: unknown): EmailCampaignSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULTS };
  const o = raw as Record<string, unknown>;
  return { dailySendLimit: clampDailyLimit(o.dailySendLimit) };
}

export async function getEmailCampaignSettings(): Promise<EmailCampaignSettings> {
  const row = await tryPrisma(async () =>
    prisma.siteSetting.findUnique({ where: { key: KEY } }),
  );
  if (!row) return { ...DEFAULTS };
  return parse(row.value);
}

export async function saveEmailCampaignSettings(
  input: Partial<EmailCampaignSettings>,
): Promise<EmailCampaignSettings> {
  const current = await getEmailCampaignSettings();
  const next: EmailCampaignSettings = {
    dailySendLimit:
      input.dailySendLimit !== undefined
        ? clampDailyLimit(input.dailySendLimit)
        : current.dailySendLimit,
  };
  await prisma.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: next },
    update: { value: next },
  });
  return next;
}

/** Start of current UTC day — daily quota window. */
export function startOfUtcDay(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function countCampaignEmailsSentSince(since: Date): Promise<number> {
  try {
    return await prisma.emailCampaignDelivery.count({
      where: { status: "sent", createdAt: { gte: since } },
    });
  } catch (error) {
    console.error("[email-campaign] count sent today failed:", error);
    return 0;
  }
}

/**
 * Pick next recipients for a campaign:
 * - unique emails only
 * - skip anyone already logged for this campaignId
 * - prefer never-mailed / oldest lastCampaignEmailAt (rotates next day)
 * - cap by remaining daily quota
 */
export async function pickEmailCampaignRecipients(input: {
  campaignId: string;
  segment: string;
  limit: number;
}): Promise<Array<{ id: string; email: string }>> {
  const limit = Math.max(0, Math.floor(input.limit));
  if (limit <= 0) return [];

  const seg = input.segment.trim().toLowerCase();
  const rows = await prisma.emailSubscriber.findMany({
    where: { isActive: true },
    orderBy: [
      { lastCampaignEmailAt: { sort: "asc", nulls: "first" } },
      { createdAt: "asc" },
    ],
    select: { id: true, email: true, tags: true, lastCampaignEmailAt: true },
  });

  const already = await prisma.emailCampaignDelivery.findMany({
    where: { campaignId: input.campaignId, status: "sent" },
    select: { email: true },
  });
  const alreadySet = new Set(already.map((r) => r.email.trim().toLowerCase()));

  const picked: Array<{ id: string; email: string }> = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const email = row.email.trim().toLowerCase();
    if (!email || seen.has(email) || alreadySet.has(email)) continue;
    if (seg && seg !== "all" && seg !== "*") {
      const tags = (row.tags ?? []).map((t) => t.trim().toLowerCase());
      if (!tags.includes(seg)) continue;
    }
    seen.add(email);
    picked.push({ id: row.id, email });
    if (picked.length >= limit) break;
  }

  return picked;
}

export async function recordEmailCampaignDelivery(input: {
  campaignId: string;
  email: string;
  status: "sent" | "failed";
}) {
  const email = input.email.trim().toLowerCase();
  if (!email) return;

  try {
    await prisma.emailCampaignDelivery.upsert({
      where: {
        campaignId_email: { campaignId: input.campaignId, email },
      },
      create: {
        campaignId: input.campaignId,
        email,
        status: input.status,
      },
      update: { status: input.status },
    });

    if (input.status === "sent") {
      await prisma.emailSubscriber.updateMany({
        where: { email },
        data: { lastCampaignEmailAt: new Date() },
      });
    }
  } catch (error) {
    console.error("[email-campaign] record delivery failed:", error);
  }
}
