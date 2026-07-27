import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readAdminJsonBody } from "@/src/server/admin/adminApiHelpers";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import {
  getAutoNotifySettings,
  saveAutoNotifySettings,
} from "@/src/server/repositories/autoNotifySettingsRepository";

const schema = z.object({
  newsOnPublish: z.boolean().optional(),
  pagesOnPublish: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  try {
    const data = await getAutoNotifySettings();
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[admin/auto-notify] get failed:", error);
    return NextResponse.json({ error: "Could not load Auto Notify settings." }, { status: 503 });
  }
}

export async function PUT(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const bodyResult = await readAdminJsonBody(request);
  if (!bodyResult.ok) return bodyResult.response;
  const parsed = schema.safeParse(bodyResult.data);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Auto Notify payload" }, { status: 400 });
  }

  try {
    const data = await saveAutoNotifySettings(parsed.data);
    await addAuditLog({
      actor: gate.subject.email,
      action: "autoNotify.update",
      target: "settings:autoNotify",
      payload: data,
    });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("[admin/auto-notify] save failed:", error);
    return NextResponse.json({ error: "Could not save Auto Notify settings." }, { status: 500 });
  }
}
