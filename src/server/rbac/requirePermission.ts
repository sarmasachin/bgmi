import { NextResponse } from "next/server";
import { getAdminSession } from "@/src/server/auth";
import { getAdminUserAuthSnapshot } from "@/src/server/repositories/adminUsersRepository";
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
 * Live auth subject (Phase 4): prefer DB role/permissions + isActive.
 * Falls back to cookie payload only when DB snapshot is unavailable.
 */
export async function getAdminAuthSubject(): Promise<AdminSessionSubject | null> {
  const session = await getAdminSession();
  if (!session) return null;

  const live = await getAdminUserAuthSnapshot(session.sub);
  if (live) {
    return {
      userId: live.id,
      email: live.email,
      role: live.role,
      permissions: live.permissions,
    };
  }

  // User missing/inactive in DB — do not trust cookie alone for Node routes.
  // (Middleware still uses cookie until /api/admin/me clears it.)
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  // Dev fallback when DB is down: cookie subject.
  const fromCookie = subjectFromSessionPayload(session);
  return fromCookie;
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
