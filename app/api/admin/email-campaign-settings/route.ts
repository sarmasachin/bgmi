import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import {
  countCampaignEmailsSentSince,
  getEmailCampaignSettings,
  saveEmailCampaignSettings,
  startOfUtcDay,
} from "@/src/server/repositories/emailCampaignSendRepository";

const schema = z.object({
  dailySendLimit: z.number().int().min(1).max(5000),
});

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  try {
    const settings = await getEmailCampaignSettings();
    const sentToday = await countCampaignEmailsSentSince(startOfUtcDay());
    return NextResponse.json({
      data: {
        ...settings,
        sentToday,
        remainingToday: Math.max(0, settings.dailySendLimit - sentToday),
      },
    });
  } catch (error) {
    console.error("[admin/email-campaign-settings] get failed:", error);
    return NextResponse.json({ error: "Could not load email campaign settings." }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = schema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "dailySendLimit must be 1–5000" }, { status: 400 });
  }

  try {
    const data = await saveEmailCampaignSettings(parsed.data);
    await addAuditLog({
      actor: gate.subject.email,
      action: "emailCampaign.settings.update",
      target: "settings:emailCampaign",
      payload: data,
    });
    const sentToday = await countCampaignEmailsSentSince(startOfUtcDay());
    return NextResponse.json({
      ok: true,
      data: {
        ...data,
        sentToday,
        remainingToday: Math.max(0, data.dailySendLimit - sentToday),
      },
    });
  } catch (error) {
    console.error("[admin/email-campaign-settings] save failed:", error);
    return NextResponse.json({ error: "Could not save email campaign settings." }, { status: 500 });
  }
}
