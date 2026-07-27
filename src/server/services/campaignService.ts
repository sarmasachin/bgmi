import { sendEmail } from "@/src/server/services/emailService";
import { sendPush } from "@/src/server/services/pushService";
import {
  createNotificationCampaign,
  updateNotificationCampaignResult,
  type CampaignChannel,
  type NotificationCampaignRow,
} from "@/src/server/repositories/notificationCampaignsRepository";
import {
  deletePushSubscriptionByEndpoint,
  isValidPushKeyPair,
  listPushSubscriptionsForSegment,
} from "@/src/server/repositories/pushSubscriptionsRepository";
import { listActiveEmailSubscribersForSegment } from "@/src/server/repositories/emailSubscribersRepository";

export type RunCampaignInput = {
  title: string;
  body: string;
  channel: CampaignChannel;
  segment: string;
};

export type RunCampaignResult = {
  campaign: NotificationCampaignRow;
  recipientCount: number;
};

function finalStatus(sent: number, fail: number, recipientCount: number) {
  if (recipientCount === 0) return "failed" as const;
  if (sent > 0 && fail === 0) return "sent" as const;
  if (sent > 0 && fail > 0) return "partial" as const;
  return "failed" as const;
}

function summarizePushFailures(reasons: string[]) {
  if (!reasons.length) return null;
  const counts = new Map<string, number>();
  for (const reason of reasons) {
    const key = reason.trim() || "Unknown push error";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([reason, count]) => (count > 1 ? `${reason} (x${count})` : reason))
    .join(" | ")
    .slice(0, 480);
}

function isCorruptSubscriptionError(reason?: string) {
  if (!reason) return false;
  const r = reason.toLowerCase();
  return r.includes("p256dh") || r.includes("65 bytes") || r.includes("auth value");
}

async function deliverPush(title: string, body: string, segment: string) {
  const subs = await listPushSubscriptionsForSegment(segment);
  let sentCount = 0;
  let failCount = 0;
  const failReasons: string[] = [];

  for (const sub of subs) {
    if (!isValidPushKeyPair(sub.p256dh, sub.auth)) {
      failCount += 1;
      failReasons.push("Invalid push keys removed (corrupt subscription)");
      await deletePushSubscriptionByEndpoint(sub.endpoint);
      continue;
    }

    const result = await sendPush({
      endpoint: sub.endpoint,
      p256dh: sub.p256dh,
      auth: sub.auth,
      title,
      body,
    });
    if (result.sent) {
      sentCount += 1;
      continue;
    }
    failCount += 1;
    if (result.reason) failReasons.push(result.reason);
    if (
      result.statusCode === 404 ||
      result.statusCode === 410 ||
      isCorruptSubscriptionError(result.reason)
    ) {
      await deletePushSubscriptionByEndpoint(sub.endpoint);
    }
  }

  const failureSummary = summarizePushFailures(failReasons);

  return {
    recipientCount: subs.length,
    sentCount,
    failCount,
    errorNote:
      subs.length === 0
        ? "No browser push subscribers for this segment. Ask users to enable notifications on the site."
        : sentCount === 0
          ? failureSummary ||
            "Push delivery failed for all subscribers. Check VAPID keys on the server."
          : failCount > 0
            ? failureSummary
            : null,
  };
}

async function deliverEmail(title: string, body: string, segment: string) {
  const subs = await listActiveEmailSubscribersForSegment(segment);
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#0f172a;"><h2 style="margin:0 0 12px;">${escapeHtml(title)}</h2><p style="margin:0;white-space:pre-wrap;">${escapeHtml(body)}</p></div>`;
  let sentCount = 0;
  let failCount = 0;

  for (const sub of subs) {
    try {
      const result = await sendEmail(sub.email, title, html);
      if (result.sent) sentCount += 1;
      else failCount += 1;
    } catch {
      failCount += 1;
    }
  }

  return {
    recipientCount: subs.length,
    sentCount,
    failCount,
    errorNote:
      subs.length === 0
        ? "No email subscribers for this segment."
        : sentCount === 0
          ? "Email delivery failed for all subscribers. Check SMTP settings."
          : null,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function runNotificationCampaign(
  input: RunCampaignInput,
): Promise<RunCampaignResult> {
  const campaign = await createNotificationCampaign(input);

  try {
    const delivery =
      input.channel === "push"
        ? await deliverPush(input.title, input.body, input.segment)
        : await deliverEmail(input.title, input.body, input.segment);

    const status = finalStatus(
      delivery.sentCount,
      delivery.failCount,
      delivery.recipientCount,
    );
    const updated = await updateNotificationCampaignResult(campaign.id, {
      status,
      sentCount: delivery.sentCount,
      failCount: delivery.failCount,
      errorNote: delivery.errorNote,
    });

    return { campaign: updated, recipientCount: delivery.recipientCount };
  } catch (error) {
    const note =
      error instanceof Error && error.message === "DB_UNAVAILABLE"
        ? "Database unavailable while sending."
        : error instanceof Error
          ? error.message
          : "Campaign send failed.";
    const updated = await updateNotificationCampaignResult(campaign.id, {
      status: "failed",
      sentCount: 0,
      failCount: 0,
      errorNote: note,
    });
    return { campaign: updated, recipientCount: 0 };
  }
}
