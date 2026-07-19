import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/src/server/rateLimit";
import { verifyAdminCredentials } from "@/src/server/authService";
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
  const ip = request.headers.get("x-forwarded-for") ?? "local";
  const rl = checkRateLimit(`admin-login:${ip}`, 10, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const user = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
  if (!user || !("id" in user) || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await createAdminSessionToken({
    userId: String(user.id),
    email: String(user.email),
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
  return response;
}
