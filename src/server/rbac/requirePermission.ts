import { NextResponse } from "next/server";
import { getAdminSession } from "@/src/server/auth";
import { resolveAdminAuthFromDb } from "@/src/server/repositories/adminUsersRepository";
import {
  can,
  canAll,
  canAny,
  type AdminPermission,
  type AdminAuthSubject,
} from "@/src/server/rbac/permissions";
import { subjectFromSessionPayload } from "@/src/server/rbac/sessionSubject";
export type AdminSessionSubject = AdminAuthSubject & {
  userId: string;
  email: string;
};

/**
 * Live auth subject: DB role/permissions + isActive only.
 * Never trusts cookie RBAC alone (prevents stale privilege after demote/deactivate).
 */
export async function getAdminAuthSubject(): Promise<AdminSessionSubject | null> {
  const session = await getAdminSession();
  if (!session) return null;

  const loaded = await resolveAdminAuthFromDb(session.sub);
  if (loaded.status === "ok") {
    return {
      userId: loaded.user.id,
      email: loaded.user.email,
      role: loaded.user.role,
      permissions: loaded.user.permissions,
    };
  }
  // Inactive account: real logout. DB miss/timeout: keep signed cookie (do not kick admin).
  if (loaded.status === "inactive") return null;

  const fromCookie = subjectFromSessionPayload(session);
  return {
    userId: fromCookie.userId,
    email: fromCookie.email,
    role: fromCookie.role,
    permissions: fromCookie.permissions,
  };
}

export async function requireAdminSession(): Promise<
  { ok: true; subject: AdminSessionSubject } | { ok: false; response: NextResponse }
> {
  const subject = await getAdminAuthSubject();
  if (!subject) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 }),
    };
  }
  return { ok: true, subject };
}

export async function requirePermission(
  permission: AdminPermission,
): Promise<
  { ok: true; subject: AdminSessionSubject } | { ok: false; response: NextResponse }
> {
  const authed = await requireAdminSession();
  if (!authed.ok) return authed;
  if (!can(authed.subject, permission)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden. You do not have permission for this action." },
        { status: 403 },
      ),
    };
  }
  return authed;
}

export async function requireAnyPermission(
  permissions: readonly AdminPermission[],
): Promise<
  { ok: true; subject: AdminSessionSubject } | { ok: false; response: NextResponse }
> {
  const authed = await requireAdminSession();
  if (!authed.ok) return authed;
  if (!canAny(authed.subject, permissions)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden. You do not have permission for this action." },
        { status: 403 },
      ),
    };
  }
  return authed;
}

export async function requireAllPermissions(
  permissions: readonly AdminPermission[],
): Promise<
  { ok: true; subject: AdminSessionSubject } | { ok: false; response: NextResponse }
> {
  const authed = await requireAdminSession();
  if (!authed.ok) return authed;
  if (!canAll(authed.subject, permissions)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden. You do not have permission for this action." },
        { status: 403 },
      ),
    };
  }
  return authed;
}
