import {
  ALL_ADMIN_PERMISSIONS,
  can,
  canAny,
  isSuperAdminRole,
  normalizeAdminRole,
  normalizePermissionList,
  type AdminAuthSubject,
  type AdminPermission,
} from "@/src/server/rbac/permissions";
import type { AdminSessionPayload } from "@/src/server/adminSession";

/** Build RBAC subject from signed session payload (Edge + Node safe). */
export function subjectFromSessionPayload(
  session: AdminSessionPayload,
): AdminAuthSubject & { userId: string; email: string } {
  const role = normalizeAdminRole(session.role ?? "superadmin");
  const permissions = isSuperAdminRole(role)
    ? [...ALL_ADMIN_PERMISSIONS]
    : normalizePermissionList(session.permissions);

  return {
    userId: session.sub,
    email: session.email,
    role,
    permissions,
  };
}

export function subjectCan(
  subject: AdminAuthSubject | null | undefined,
  required: AdminPermission | readonly AdminPermission[],
): boolean {
  if (!subject) return false;
  if (typeof required === "string") return can(subject, required);
  return canAny(subject, required);
}
