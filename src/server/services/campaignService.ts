import { after } from "next/server";
import { sendEmail } from "@/src/server/services/emailService";
import { sendPush } from "@/src/server/services/pushService";
import { normalizePushClickUrl } from "@/src/lib/pushClickUrl";
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
import {
  countCampaignEmailsSentSince,
  emailSendIntervalMs,
  emailsPerMinuteFromDailyLimit,
  getEmailCampaignSettings,
  pickEmailCampaignRecipients,
  recordEmailCampaignDelivery,
  startOfUtcDay,
} from "@/src/server/repositories/emailCampaignSendRepository";

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export type RunCampaignInput = {
  title: string;
  body: string;
  channel: CampaignChannel;
  segment: string;
  /** Optional click / email link. Invalid values fall back to "/" — never fails send. */
  url?: string;
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

async function deliverPush(title: string, body: string, segment: string, url: string) {
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
      url,
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

function siteOriginForEmail() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "https://sensitivitysettings.com";
  try {
    return new URL(raw).origin;
  } catch {
    return "https://sensitivitysettings.com";
  }
}

function absoluteEmailHref(url: string) {
  const normalized = normalizePushClickUrl(url);
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }
  try {
    return new URL(normalized, siteOriginForEmail()).href;
  } catch {
    return siteOriginForEmail() + "/";
  }
}

async function deliverEmail(
  campaignId: string,
  title: string,
  body: string,
  segment: string,
  url: string,
) {
  const settings = await getEmailCampaignSettings();
  const sentToday = await countCampaignEmailsSentSince(startOfUtcDay());
  const remainingToday = Math.max(0, settings.dailySendLimit - sentToday);

  if (remainingToday <= 0) {
    return {
      recipientCount: 0,
      sentCount: 0,
      failCount: 0,
      errorNote: `Daily email limit reached (${settings.dailySendLimit}/day UTC). Try again tomorrow — remaining subscribers will be rotated next.`,
    };
  }

  const recipients = await pickEmailCampaignRecipients({
    campaignId,
    segment,
    limit: remainingToday,
  });

  const showLink = Boolean(url && String(url).trim());
  const linkBlock = showLink
    ? `<p style="margin:16px 0 0;"><a href="${escapeHtml(absoluteEmailHref(url))}" style="color:#0f766e;font-weight:600;">Open link</a></p>`
    : "";
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#0f172a;"><h2 style="margin:0 0 12px;">${escapeHtml(title)}</h2><p style="margin:0;white-space:pre-wrap;">${escapeHtml(body)}</p>${linkBlock}</div>`;
  let sentCount = 0;
  let failCount = 0;
  // 950/day → ~1 email / 1.5 min (spread evenly over 24h).
  const intervalMs = emailSendIntervalMs(settings.dailySendLimit);
  let sentAttempt = 0;

  // Deduplicate within this run (extra safety).
  const seen = new Set<string>();
  for (const sub of recipients) {
    const email = sub.email.trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    if (sentAttempt > 0 && intervalMs > 0) {
      await sleep(intervalMs);
    }
    sentAttempt += 1;
    try {
      const result = await sendEmail(email, title, html);
      if (result.sent) {
        sentCount += 1;
        await recordEmailCampaignDelivery({
          campaignId,
          email,
          status: "sent",
        });
      } else {
        failCount += 1;
        await recordEmailCampaignDelivery({
          campaignId,
          email,
          status: "failed",
        });
      }
    } catch {
      failCount += 1;
      await recordEmailCampaignDelivery({
        campaignId,
        email,
        status: "failed",
      });
    }
  }

  const hitDailyCap = seen.size >= remainingToday;
  let errorNote: string | null = null;
  if (seen.size === 0) {
    errorNote =
      remainingToday <= 0
        ? `Daily email limit reached (${settings.dailySendLimit}/day UTC). Try again tomorrow.`
        : "No email subscribers left for this segment (or all already got this campaign).";
  } else if (sentCount === 0) {
    errorNote = "Email delivery failed for all recipients. Check SMTP settings.";
  } else {
    const parts: string[] = [];
    if (failCount > 0) parts.push(`${failCount} failed`);
    if (hitDailyCap) {
      parts.push(
        `Daily quota ${settings.dailySendLimit}/day — other subscribers rotate on next send / tomorrow`,
      );
    }
    errorNote = parts.length ? parts.join(". ") : null;
  }

  return {
    recipientCount: seen.size,
    sentCount,
    failCount,
    errorNote,
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
  const clickUrl = normalizePushClickUrl(input.url);
  const campaign = await createNotificationCampaign({
    title: input.title,
    body: input.body,
    channel: input.channel,
    segment: input.segment,
  });

  try {
    if (input.channel === "email") {
      const settings = await getEmailCampaignSettings();
      const intervalMs = emailSendIntervalMs(settings.dailySendLimit);
      const perMin = emailsPerMinuteFromDailyLimit(settings.dailySendLimit);
      const queuedNote = `Queued — pacing ~${perMin.toFixed(2)}/min (~${Math.round(intervalMs / 1000)}s between emails; ${settings.dailySendLimit}/day over 24h). Refresh list for progress.`;

      const queued = await updateNotificationCampaignResult(campaign.id, {
        status: "queued",
        sentCount: 0,
        failCount: 0,
        errorNote: queuedNote,
      });

      after(async () => {
        try {
          const delivery = await deliverEmail(
            campaign.id,
            input.title,
            input.body,
            input.segment,
            input.url?.trim() ? clickUrl : "",
          );
          const status = finalStatus(
            delivery.sentCount,
            delivery.failCount,
            delivery.recipientCount,
          );
          await updateNotificationCampaignResult(campaign.id, {
            status,
            sentCount: delivery.sentCount,
            failCount: delivery.failCount,
            errorNote: delivery.errorNote,
          });
        } catch (error) {
          const note =
            error instanceof Error && error.message === "DB_UNAVAILABLE"
              ? "Database unavailable while sending."
              : error instanceof Error
                ? error.message
                : "Campaign send failed.";
          await updateNotificationCampaignResult(campaign.id, {
            status: "failed",
            sentCount: 0,
            failCount: 0,
            errorNote: note,
          }).catch(() => undefined);
        }
      });

      return {
        campaign: queued,
        recipientCount: 0,
      };
    }

    const delivery = await deliverPush(
      input.title,
      input.body,
      input.segment,
      clickUrl,
    );

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
