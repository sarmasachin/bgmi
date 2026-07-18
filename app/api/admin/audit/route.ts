import { NextResponse } from "next/server";
import { getAdminAuditRows } from "@/src/server/repositories/adminAuditRepository";
import { clearAllAuditLogs } from "@/src/server/repositories/auditRepository";

export async function GET() {
  const data = await getAdminAuditRows();
  return NextResponse.json({ data });
}

export async function DELETE() {
  const deleted = await clearAllAuditLogs();
  return NextResponse.json({ ok: true, deleted });
}
