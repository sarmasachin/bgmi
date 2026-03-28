import { prisma, tryPrisma } from "@/src/server/dbSafe";

export async function addAuditLog(input: {
  actor: string;
  action: string;
  target: string;
  payload?: unknown;
}) {
  await tryPrisma(async () =>
    prisma.auditLog.create({
      data: {
        actor: input.actor,
        action: input.action,
        target: input.target,
        payload: (input.payload ?? {}) as object,
      },
    }),
  );
}

/** Returns rows removed, or 0 when Prisma is unavailable (e.g. mock-only dev). */
export async function clearAllAuditLogs(): Promise<number> {
  const count = await tryPrisma(async () => {
    const result = await prisma.auditLog.deleteMany({});
    return result.count;
  });
  return count ?? 0;
}
