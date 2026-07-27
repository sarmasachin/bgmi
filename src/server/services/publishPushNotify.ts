import { runNotificationCampaign } from "@/src/server/services/campaignService";
import { normalizePushClickUrl } from "@/src/lib/pushClickUrl";

export type PublishPushSource = "news" | "page";

/**
 * Optional push after publish. Only runs when admin checked "Send push notification".
 * Failures are logged and returned as warning — publish itself already succeeded.
 */
export async function maybeSendPublishPush(input: {
  sendPush: boolean;
  source: PublishPushSource;
  title: string;
  body?: string;
  urlPath?: string;
}): Promise<{ sent: boolean; warning?: string }> {
  if (!input.sendPush) return { sent: false };

  const title = input.title.trim() || "Sensitivity Settings update";
  const clickUrl = normalizePushClickUrl(input.urlPath);
  const body =
    (input.body || "").trim() ||
    (clickUrl !== "/"
      ? `New update is live: ${clickUrl}`
      : "A new update is live on Sensitivity Settings.");

  try {
    const result = await runNotificationCampaign({
      title: title.slice(0, 120),
      body: body.slice(0, 4000),
      channel: "push",
      segment: "all",
      url: clickUrl,
    });
    if (result.campaign.status === "sent" || result.campaign.status === "partial") {
      return { sent: true };
    }
    return {
      sent: false,
      warning: result.campaign.errorNote || "Push notification could not be delivered.",
    };
  } catch (error) {
    console.error(`[push] publish notify (${input.source}) failed:`, error);
    return { sent: false, warning: "Push notification failed to send." };
  }
}
