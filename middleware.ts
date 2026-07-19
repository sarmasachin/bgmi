import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/src/server/adminSession";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/ads" || pathname === "/admin/ads/") {
    return NextResponse.redirect(new URL("/admin/ad-placements", request.url));
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  if (
    pathname === "/admin/login" ||
    pathname === "/admin/ratings" ||
    pathname === "/api/admin/auth/login" ||
    pathname === "/api/admin/auth/logout" ||
    pathname === "/api/admin/auth/setup" ||
    pathname === "/api/admin/auth/setup-status" ||
    pathname === "/api/admin/ratings" ||
    pathname === "/api/admin/auth/request-reset" ||
    pathname === "/api/admin/auth/reset-password"
  ) {
    return NextResponse.next();
  }

  const raw = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(raw);
  if (session) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
