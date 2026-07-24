import { NextResponse, NextRequest } from "next/server";
import { getAdminAuditRows } from "@/src/server/repositories/adminAuditRepository";
import { clearAllAuditLogs } from "@/src/server/repositories/auditRepository";
import { enforceAdminApiAccess } from "@/src/server/rbac/enforceAdminApiAccess";

export async function GET(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const data = await getAdminAuditRows();
  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest) {
  const gate = await enforceAdminApiAccess(request);
  if (!gate.ok) return gate.response;
  const deleted = await clearAllAuditLogs();
  return NextResponse.json({ ok: true, deleted });
}
