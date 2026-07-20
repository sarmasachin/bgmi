import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/src/server/adminSession";
import { isAdminMutationOriginAllowed } from "@/src/server/adminRequestOrigin";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPreview = request.nextUrl.searchParams.get("preview") === "1";

  if (pathname === "/admin/ads" || pathname === "/admin/ads/") {
    return NextResponse.redirect(new URL("/admin/ad-placements", request.url));
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    const response = NextResponse.next();
    if (isPreview) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    }
    return response;
  }

  if (isAdminApi && !isAdminMutationOriginAllowed(request)) {
    return NextResponse.json({ error: "Forbidden origin." }, { status: 403 });
  }

  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/auth/login" ||
    pathname === "/api/admin/auth/logout" ||
    pathname === "/api/admin/auth/setup" ||
    pathname === "/api/admin/auth/setup-status"
  ) {
    return NextResponse.next();
  }

  const raw = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(raw);
  if (session) {
    return NextResponse.next();
  }

  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    /*
     * Public pages: attach X-Robots-Tag on ?preview=1 so draft preview URLs stay unindexed.
     * Skip Next internals and static files.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
