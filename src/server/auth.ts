import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
  type AdminSessionPayload,
} from "@/src/server/adminSession";

export { ADMIN_SESSION_COOKIE } from "@/src/server/adminSession";
export {
  can,
  canAny,
  canAll,
  normalizeAdminRole,
  isSuperAdminRole,
  resolvePermissions,
  ALL_ADMIN_PERMISSIONS,
  ADMIN_PERMISSIONS,
  ADMIN_PERMISSION_MODULES,
  ADMIN_PERMISSION_PRESETS,
  sanitizeSubadminPermissions,
  type AdminPermission,
  type AdminRole,
} from "@/src/server/rbac/permissions";
export {
  getAdminAuthSubject,
  requireAdminSession,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
} from "@/src/server/rbac/requirePermission";

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(value);
}

export async function isAdminLoggedIn(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}
