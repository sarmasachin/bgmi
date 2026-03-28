import { NextResponse } from "next/server";
import { prisma, tryPrisma } from "@/src/server/dbSafe";
import { clearAllAuditLogs } from "@/src/server/repositories/auditRepository";

export async function GET() {
  const data = await tryPrisma(async () =>
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  );
  return NextResponse.json({ data: data ?? [] });
}

export async function DELETE() {
  const deleted = await clearAllAuditLogs();
  return NextResponse.json({ ok: true, deleted });
}
