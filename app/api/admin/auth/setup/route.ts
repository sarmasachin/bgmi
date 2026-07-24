import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/src/server/rateLimit";
import { getRequestIp } from "@/src/server/requestIp";
import {
  countAdminUsers,
  setPrimaryAdminCredentials,
} from "@/src/server/repositories/adminUsersRepository";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
} from "@/src/server/adminSession";
import { createSessionTokenFromAuthSnapshot } from "@/src/server/rbac/sessionFromUser";
import {
  normalizeAdminRole,
  resolvePermissions,
} from "@/src/server/rbac/permissions";

const schema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  name: z.string().trim().max(200).optional(),
  bootstrapSecret: z.string().max(200).optional(),
});

function bootstrapEnabled() {
  const secret = process.env.ADMIN_BOOTSTRAP_SECRET?.trim() ?? "";
  if (secret.length < 16) return false;
  // Production takeover requires explicit opt-in (empty-DB first setup still works without this).
  if (process.env.NODE_ENV === "production" && process.env.ADMIN_BOOTSTRAP_ALLOW !== "1") {
    return false;
  }
  return true;
}

function bootstrapSecretOk(provided: string | undefined) {
  if (!bootstrapEnabled()) return false;
  const expected = process.env.ADMIN_BOOTSTRAP_SECRET!.trim();
  if (!provided || provided.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Create the first admin (empty DB), or replace primary admin when
 * ADMIN_BOOTSTRAP_SECRET matches (for lockout recovery / setting Gmail + password).
 */
export async function POST(request: NextRequest) {
  const ip = getRequestIp(request);
  const rl = checkRateLimit(`admin-setup:${ip}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email and password (min 8 characters)." },
      { status: 400 },
    );
  }

  const count = await countAdminUsers();
  if (count === null) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const forceReplace = count > 0;
  if (forceReplace && !bootstrapSecretOk(parsed.data.bootstrapSecret)) {
    return NextResponse.json({ error: "Setup not allowed." }, { status: 403 });
  }

  let result;
  try {
    result = await setPrimaryAdminCredentials({
      email: parsed.data.email,
      password: parsed.data.password,
      name: parsed.data.name,
      forceReplace,
    });
  } catch (err) {
    console.error("[admin-setup] failed:", err);
    return NextResponse.json({ error: "Could not save admin credentials." }, { status: 503 });
  }

  if ("error" in result) {
    if (result.error === "exists") {
      return NextResponse.json({ error: "Setup not allowed." }, { status: 403 });
    }
    if (result.error === "duplicate") {
      return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not save admin credentials." }, { status: 503 });
  }

  try {
    const token = await createSessionTokenFromAuthSnapshot({
      id: result.id,
      email: result.email,
      role: normalizeAdminRole(result.role),
      permissions: resolvePermissions(result.role, result.permissions),
      isActive: true,
    });

    const response = NextResponse.json({ ok: true, email: result.email });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
    return response;
  } catch (err) {
    console.error("[admin-setup] session create failed:", err);
    return NextResponse.json(
      { error: "Account saved, but login session failed. Try logging in." },
      { status: 500 },
    );
  }
}
