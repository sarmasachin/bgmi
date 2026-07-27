import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import { runNotificationCampaign } from "@/src/server/services/campaignService";
import {
  deleteNotificationCampaign,
  listNotificationCampaigns,
} from "@/src/server/repositories/notificationCampaignsRepository";
import { countPushSubscriptions } from "@/src/server/repositories/pushSubscriptionsRepository";
import { countActiveEmailSubscribers } from "@/src/server/repositories/emailSubscribersRepository";

const schema = z.object({
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(2).max(4000),
  channel: z.enum(["push", "email"]),
  segment: z.string().trim().min(1).max(40),
  /** Optional. Empty / invalid → homepage. Never rejects the campaign. */
  url: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  try {
    const [campaigns, pushCount, emailCount] = await Promise.all([
      listNotificationCampaigns(50),
      countPushSubscriptions(),
      countActiveEmailSubscribers(),
    ]);
    return NextResponse.json({
      data: campaigns,
      stats: { pushCount, emailCount },
    });
  } catch (error) {
    console.error("[admin/notifications] list failed:", error);
    return NextResponse.json({ error: "Database unavailable. Please try again." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = schema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid campaign payload" }, { status: 400 });
  }

  try {
    const result = await runNotificationCampaign({
      title: parsed.data.title,
      body: parsed.data.body,
      channel: parsed.data.channel,
      segment: parsed.data.segment,
      url: parsed.data.url || undefined,
    });

    await addAuditLog({
      actor: gate.subject.email,
      action: "campaign.send",
      target: result.campaign.id,
      payload: {
        channel: result.campaign.channel,
        segment: result.campaign.segment,
        status: result.campaign.status,
        sentCount: result.campaign.sentCount,
        failCount: result.campaign.failCount,
        recipientCount: result.recipientCount,
        url: parsed.data.url || "/",
      },
    });

    const ok =
      result.campaign.status === "sent" || result.campaign.status === "partial";
    return NextResponse.json(
      {
        ok,
        data: result.campaign,
        recipientCount: result.recipientCount,
        ...(result.campaign.errorNote ? { warning: result.campaign.errorNote } : {}),
      },
      { status: ok ? 200 : 422 },
    );
  } catch (error) {
    console.error("[admin/notifications] send failed:", error);
    const unavailable = error instanceof Error && error.message === "DB_UNAVAILABLE";
    return NextResponse.json(
      { error: unavailable ? "Database unavailable. Please try again." : "Campaign send failed." },
      { status: unavailable ? 503 : 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const id = request.nextUrl.searchParams.get("id")?.trim() ?? "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  try {
    await deleteNotificationCampaign(id);
    await addAuditLog({
      actor: gate.subject.email,
      action: "campaign.delete",
      target: id,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/notifications] delete failed:", error);
    const unavailable = error instanceof Error && error.message === "DB_UNAVAILABLE";
    return NextResponse.json(
      { error: unavailable ? "Database unavailable. Please try again." : "Could not delete campaign." },
      { status: unavailable ? 503 : 500 },
    );
  }
}
