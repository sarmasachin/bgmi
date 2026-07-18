import { prisma, tryPrisma } from "@/src/server/dbSafe";

export type AdminAuditRow = {
  id: string;
  actor: string;
  action: string;
  target: string;
  createdAt: string;
};

export async function getAdminAuditRows(): Promise<AdminAuditRow[]> {
  const data = await tryPrisma(async () =>
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  );

  return (data ?? []).map((row) => ({
    id: row.id,
    actor: row.actor,
    action: row.action,
    target: row.target,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  }));
}
