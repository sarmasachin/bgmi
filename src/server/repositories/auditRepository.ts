import { prisma, tryPrisma } from "@/src/server/dbSafe";
import { resolveAuditActor } from "@/src/server/rbac/auditActor";

export async function addAuditLog(input: {
  /** Prefer email; `"admin"` is replaced with live session actor. */
  actor?: string;
  action: string;
  target: string;
  payload?: unknown;
}) {
  const actor = await resolveAuditActor(input.actor);

  await tryPrisma(async () =>
    prisma.auditLog.create({
      data: {
        actor,
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

export async function currentAuditActorLabel(): Promise<string> {
  return resolveAuditActor();
}
