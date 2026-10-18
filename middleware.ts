import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/src/server/adminSession";
import { ADMIN_NO_ADS_COOKIE } from "@/src/lib/adminNoAdsFlag";
import { syncAdminNoAdsCookie } from "@/src/server/adminNoAdsCookie";
import { isAdminMutationOriginAllowed } from "@/src/server/adminRequestOrigin";
import { resolveAdminApiPermission } from "@/src/server/rbac/routeAccess";
import { subjectFromSessionPayload } from "@/src/server/rbac/sessionSubject";
import { can, canAny } from "@/src/server/rbac/permissions";

/** Prevent browser/bfcache from restoring protected admin pages after logout. */
function withAdminNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return response;
}

/** Root layout reads this so AdSense Auto ads are not in the admin HTML. */
function nextAdminPage(request: NextRequest, loggedIn: boolean) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  if (loggedIn) requestHeaders.set("x-admin-no-ads", "1");
  const response = withAdminNoStore(NextResponse.next({ request: { headers: requestHeaders } }));
  syncAdminNoAdsCookie(response, request.cookies.get(ADMIN_NO_ADS_COOKIE)?.value, loggedIn);
  return response;
}

function continuePublic(request: NextRequest, loggedIn: boolean) {
  let response: NextResponse;
  if (loggedIn) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-admin-no-ads", "1");
    response = NextResponse.next({ request: { headers: requestHeaders } });
  } else {
    response = NextResponse.next();
  }
  syncAdminNoAdsCookie(response, request.cookies.get(ADMIN_NO_ADS_COOKIE)?.value, loggedIn);
  return response;
}

function forbiddenJson() {
  return NextResponse.json(
    { error: "Forbidden. You do not have permission for this action." },
    { status: 403 },
  );
}

export async function middleware(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const rawHost = (forwardedHost || request.headers.get("host") || "").split(":")[0].toLowerCase();

  // Force apex host: www.sensitivitysettings.com → https://sensitivitysettings.com/...
  if (rawHost === "www.sensitivitysettings.com") {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(`https://sensitivitysettings.com${pathname}${search}`, 308);
  }

  const { pathname } = request.nextUrl;
  const isPreview = request.nextUrl.searchParams.get("preview") === "1";

  if (pathname === "/admin/ads" || pathname === "/admin/ads/") {
    return withAdminNoStore(NextResponse.redirect(new URL("/admin/ad-placements", request.url)));
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    const raw = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = raw ? await verifyAdminSessionToken(raw) : null;
    const response = continuePublic(request, Boolean(session));
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
    pathname === "/api/admin/auth/verify-otp" ||
    pathname === "/api/admin/auth/resend-otp" ||
    pathname === "/api/admin/auth/logout" ||
    pathname === "/api/admin/auth/setup" ||
    pathname === "/api/admin/auth/setup-status"
  ) {
    if (!isAdminPage) return NextResponse.next();
    const raw = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = raw ? await verifyAdminSessionToken(raw) : null;
    return nextAdminPage(request, Boolean(session));
  }

  const raw = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = await verifyAdminSessionToken(raw);
  if (!session) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized. Please log in again." }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    const response = withAdminNoStore(NextResponse.redirect(loginUrl));
    syncAdminNoAdsCookie(response, request.cookies.get(ADMIN_NO_ADS_COOKIE)?.value, false);
    return response;
  }

  // Phase 3: enforce RBAC on admin APIs (pages are guarded in server components).
  if (isAdminApi) {
    const subject = subjectFromSessionPayload(session);
    const rule = resolveAdminApiPermission(pathname, request.method);

    if (rule.type === "deny") {
      return forbiddenJson();
    }
    if (rule.type === "permission" && !can(subject, rule.permission)) {
      return forbiddenJson();
    }
    if (rule.type === "any" && !canAny(subject, rule.permissions)) {
      return forbiddenJson();
    }
    // auth-only → allowed for any valid session
  }

  return isAdminPage ? nextAdminPage(request, true) : NextResponse.next();
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
