import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  adminSessionCookieOptions,
} from "@/src/server/adminSession";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    ...adminSessionCookieOptions(0),
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  // Drop cached admin HTML so Back does not flash a logged-in dashboard.
  response.headers.set("Clear-Site-Data", '"cache"');
  return response;
}
