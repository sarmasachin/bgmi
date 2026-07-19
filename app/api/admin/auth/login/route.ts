import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/src/server/authService";
import {
  clearAdminLoginFailures,
  formatLockMessage,
  getAdminLoginLockKey,
  getAdminLoginLockStatus,
  recordAdminLoginFailure,
} from "@/src/server/adminLoginLockout";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
} from "@/src/server/adminSession";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export async function POST(request: NextRequest) {
  const lockKey = getAdminLoginLockKey(request);
  const lock = getAdminLoginLockStatus(lockKey);
  if (lock.locked) {
    return NextResponse.json(
      { error: formatLockMessage(lock.retryAfterSec), retryAfterSec: lock.retryAfterSec },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const user = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
  if (!user || !("id" in user) || !user.id) {
    const afterFail = recordAdminLoginFailure(lockKey);
    if (afterFail.locked) {
      return NextResponse.json(
        {
          error: formatLockMessage(afterFail.retryAfterSec),
          retryAfterSec: afterFail.retryAfterSec,
        },
        { status: 429 },
      );
    }
    const left = 5 - afterFail.fails;
    return NextResponse.json(
      {
        error:
          left > 0
            ? `Invalid credentials. ${left} attempt${left === 1 ? "" : "s"} left before a 10-minute lock.`
            : "Invalid credentials",
      },
      { status: 401 },
    );
  }

  clearAdminLoginFailures(lockKey);

  try {
    const token = await createAdminSessionToken({
      userId: String(user.id),
      email: String(user.email),
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
    return response;
  } catch (err) {
    console.error("[admin-login] session create failed:", err);
    return NextResponse.json(
      { error: "Login temporarily unavailable. Please try again later." },
      { status: 500 },
    );
  }
}
