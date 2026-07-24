import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { resolveAdminApiPermission } from "@/src/server/rbac/routeAccess";
import {
  requireAdminSession,
  requireAnyPermission,
  requirePermission,
  type AdminSessionSubject,
} from "@/src/server/rbac/requirePermission";

export type AdminApiGate =
  | { ok: true; subject: AdminSessionSubject }
  | { ok: false; response: NextResponse };

/**
 * Live DB RBAC for admin API routes (not cookie-only).
 * Call at the top of every /api/admin/* handler except auth allowlist routes.
 */
export async function enforceAdminApiAccess(request: NextRequest): Promise<AdminApiGate> {
  const rule = resolveAdminApiPermission(request.nextUrl.pathname, request.method);

  if (rule.type === "deny") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden. You do not have permission for this action." },
        { status: 403 },
      ),
    };
  }

  if (rule.type === "auth-only") {
    return requireAdminSession();
  }

  if (rule.type === "permission") {
    return requirePermission(rule.permission);
  }

  return requireAnyPermission(rule.permissions);
}
