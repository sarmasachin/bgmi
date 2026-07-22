import { redirect } from "next/navigation";
import { getAdminAuthSubject, type AdminSessionSubject } from "@/src/server/rbac/requirePermission";
import { subjectCan } from "@/src/server/rbac/sessionSubject";
import {
  ADMIN_NAV_ACCESS,
  pagePermissionForPath,
} from "@/src/server/rbac/routeAccess";
import type { AdminPermission } from "@/src/server/rbac/permissions";

export function firstAllowedAdminPath(subject: AdminSessionSubject): string {
  for (const item of ADMIN_NAV_ACCESS) {
    if (subjectCan(subject, item.anyOf)) return item.href;
  }
  return "/admin/login";
}

/**
 * Server page guard. Returns subject when allowed.
 * Redirects to login when logged out; returns denied flag when forbidden.
 */
export async function requireAdminPageAccess(
  required?: AdminPermission | readonly AdminPermission[] | null,
  pathnameForDefault?: string,
): Promise<
  | { ok: true; subject: AdminSessionSubject }
  | { ok: false; reason: "denied"; subject: AdminSessionSubject }
> {
  const subject = await getAdminAuthSubject();
  if (!subject) {
    redirect("/admin/login");
  }

  const need =
    required ??
    (pathnameForDefault ? pagePermissionForPath(pathnameForDefault) : ["dashboard.view"]);

  if (!need || need.length === 0) {
    return { ok: true, subject };
  }

  if (!subjectCan(subject, need)) {
    return { ok: false, reason: "denied", subject };
  }
  return { ok: true, subject };
}
