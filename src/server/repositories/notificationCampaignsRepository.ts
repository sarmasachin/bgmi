import { prisma } from "@/src/server/dbSafe";

export type CampaignChannel = "email" | "push";
export type CampaignStatus = "queued" | "sent" | "failed" | "partial";

export type NotificationCampaignRow = {
  id: string;
  title: string;
  body: string;
  channel: CampaignChannel;
  segment: string;
  status: CampaignStatus;
  sentCount: number;
  failCount: number;
  errorNote: string | null;
  createdAt: string;
};

function mapRow(row: {
  id: string;
  title: string;
  body: string;
  channel: string;
  segment: string;
  status: string;
  sentCount: number;
  failCount: number;
  errorNote: string | null;
  createdAt: Date;
}): NotificationCampaignRow {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    channel: row.channel === "push" ? "push" : "email",
    segment: row.segment,
    status:
      row.status === "sent" ||
      row.status === "failed" ||
      row.status === "partial" ||
      row.status === "queued"
        ? row.status
        : "queued",
    sentCount: row.sentCount,
    failCount: row.failCount,
    errorNote: row.errorNote,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listNotificationCampaigns(limit = 50) {
  try {
    const rows = await prisma.notificationCampaign.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.min(100, Math.max(1, limit)),
    });
    return rows.map(mapRow);
  } catch (error) {
    console.error("[campaign] listNotificationCampaigns failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function createNotificationCampaign(input: {
  title: string;
  body: string;
  channel: CampaignChannel;
  segment: string;
}) {
  try {
    const row = await prisma.notificationCampaign.create({
      data: {
        title: input.title.trim(),
        body: input.body.trim(),
        channel: input.channel,
        segment: input.segment.trim() || "all",
        status: "queued",
      },
    });
    return mapRow(row);
  } catch (error) {
    console.error("[campaign] createNotificationCampaign failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function updateNotificationCampaignResult(
  id: string,
  input: {
    status: CampaignStatus;
    sentCount: number;
    failCount: number;
    errorNote?: string | null;
  },
) {
  try {
    const row = await prisma.notificationCampaign.update({
      where: { id },
      data: {
        status: input.status,
        sentCount: input.sentCount,
        failCount: input.failCount,
        errorNote: input.errorNote ?? null,
      },
    });
    return mapRow(row);
  } catch (error) {
    console.error("[campaign] updateNotificationCampaignResult failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
}

export async function deleteNotificationCampaign(id: string) {
  try {
    await prisma.notificationCampaign.delete({ where: { id } });
    return true;
  } catch (error) {
    console.error("[campaign] deleteNotificationCampaign failed:", error);
    throw new Error("DB_UNAVAILABLE");
  }
}
