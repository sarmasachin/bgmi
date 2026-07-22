import type { NextRequest } from "next/server";

function hostFromUrl(value: string): string | null {
  try {
    return new URL(value).host.toLowerCase();
  } catch {
    return null;
  }
}

/** Compare hosts ignoring www. and ports (nginx proxy / apex vs www). */
function normalizeHost(host: string): string {
  return host
    .trim()
    .toLowerCase()
    .split(",")[0]
    ?.trim()
    .replace(/:\d+$/, "")
    .replace(/^www\./, "") ?? "";
}

function hostsMatch(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  return normalizeHost(a) === normalizeHost(b);
}

/**
 * Block cross-site mutating requests to admin APIs (CSRF mitigation).
 * Same-site browser fetches send Origin; we require Origin, Referer, or Sec-Fetch-Site.
 */
export function isAdminMutationOriginAllowed(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;

  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api/admin")) return true;

  // Modern browsers send this on fetch(); same-origin admin UI is safe.
  const secFetchSite = (request.headers.get("sec-fetch-site") || "").toLowerCase();
  if (secFetchSite === "same-origin" || secFetchSite === "same-site") {
    return true;
  }

  const expectedHost = (request.headers.get("x-forwarded-host") || request.headers.get("host") || "")
    .split(",")[0]
    ?.trim()
    .toLowerCase();
  if (!expectedHost) return false;

  const origin = request.headers.get("origin");
  if (origin) {
    return hostsMatch(hostFromUrl(origin), expectedHost);
  }

  const referer = request.headers.get("referer");
  if (referer) {
    return hostsMatch(hostFromUrl(referer), expectedHost);
  }

  return false;
}
