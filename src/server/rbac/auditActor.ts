import { getAdminSession } from "@/src/server/auth";
import { getAdminUserAuthSnapshot } from "@/src/server/repositories/adminUsersRepository";
import type { AdminSessionSubject } from "@/src/server/rbac/requirePermission";

/** Human-readable audit actor, e.g. `owner@site.com (superadmin)`. */
export function formatAuditActor(subject: {
  email: string;
  role: string;
}): string {
  return `${subject.email} (${subject.role})`;
}

/**
 * Resolve actor for audit logs.
 * Prefer explicit actor; otherwise use live session; fallback "admin".
 */
export async function resolveAuditActor(explicit?: string): Promise<string> {
  const trimmed = explicit?.trim();
  if (trimmed && trimmed !== "admin") return trimmed;

  const session = await getAdminSession();
  if (!session?.email) return trimmed || "admin";

  const live = await getAdminUserAuthSnapshot(session.sub);
  if (live) {
    return formatAuditActor({ email: live.email, role: live.role });
  }

  const role = session.role?.trim() || "admin";
  return formatAuditActor({ email: session.email, role });
}

export function auditActorFromSubject(subject: AdminSessionSubject): string {
  return formatAuditActor(subject);
}
