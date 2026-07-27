import { NextRequest, NextResponse } from "next/server";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";
import { addAuditLog } from "@/src/server/repositories/auditRepository";
import {
  deactivateEmailSubscriber,
  listEmailSubscribers,
  syncSiteEmailsIntoSubscribers,
} from "@/src/server/repositories/emailSubscribersRepository";

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;

  try {
    await syncSiteEmailsIntoSubscribers();
    const data = await listEmailSubscribers(300);
    return NextResponse.json({ data, count: data.length });
  } catch (error) {
    console.error("[admin/notifications/subscribers] list failed:", error);
    return NextResponse.json({ error: "Database unavailable. Please try again." }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;

  const email = request.nextUrl.searchParams.get("email")?.trim() ?? "";
  if (!email) {
    return NextResponse.json({ error: "email required" }, { status: 400 });
  }

  try {
    await deactivateEmailSubscriber(email);
    await addAuditLog({
      actor: gate.subject.email,
      action: "campaign.subscriber.remove",
      target: email.toLowerCase(),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/notifications/subscribers] delete failed:", error);
    return NextResponse.json({ error: "Database unavailable. Please try again." }, { status: 503 });
  }
}
