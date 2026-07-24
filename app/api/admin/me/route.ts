import { NextResponse, NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  verifyAdminSessionToken,
} from "@/src/server/adminSession";
import { cookies } from "next/headers";
import { getAdminUserAuthSnapshot } from "@/src/server/repositories/adminUsersRepository";
import { createSessionTokenFromAuthSnapshot } from "@/src/server/rbac/sessionFromUser";

function clearSession(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...adminSessionCookieOptions(0),
    maxAge: 0,
  });
  return response;
}

/**
 * Any logged-in admin — sidebar + session probes.
 * Re-check isActive from DB and refresh cookie permissions live.
 * Clears cookie when account is inactive/missing (revocation).
 */
export async function GET(_request: NextRequest) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(raw);

  if (!session) {
    return clearSession(
      NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 }),
    );
  }

  const live = await getAdminUserAuthSnapshot(session.sub);
  if (!live) {
    return clearSession(
      NextResponse.json(
        { error: "Account inactive or not found. Please log in again." },
        { status: 401 },
      ),
    );
  }

  const token = await createSessionTokenFromAuthSnapshot(live);
  const response = NextResponse.json({
    ok: true,
    me: {
      id: live.id,
      email: live.email,
      role: live.role,
      permissions: live.permissions,
    },
  });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
  return response;
}
