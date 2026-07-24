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
  return (
    host
      .trim()
      .toLowerCase()
      .split(",")[0]
      ?.trim()
      .replace(/:\d+$/, "")
      .replace(/^www\./, "") ?? ""
  );
}

function hostsMatch(a: string | null, b: string | null): boolean {
  if (!a || !b) return false;
  return normalizeHost(a) === normalizeHost(b);
}

function expectedSiteHosts(): string[] {
  const hosts: string[] = [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || process.env.SITE_URL?.trim();
  if (siteUrl) {
    const h = hostFromUrl(siteUrl);
    if (h) hosts.push(h);
  }
  hosts.push("sensitivitysettings.com");
  return hosts;
}

/**
 * Block cross-site mutating requests to admin APIs (CSRF mitigation).
 * Prefer configured site host over client-influenced X-Forwarded-Host.
 */
export function isAdminMutationOriginAllowed(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return true;

  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api/admin")) return true;

  // Auth bootstrap/login may be called without Origin in some clients — still require Origin/Referer below.
  const secFetchSite = (request.headers.get("sec-fetch-site") || "").toLowerCase();
  // Only trust same-origin (not same-site) — tighter CSRF boundary.
  if (secFetchSite === "same-origin") {
    return true;
  }
  // Ignore spoofable "same-site" / "none" without Origin match.

  const configured = expectedSiteHosts();
  const headerHost = (request.headers.get("host") || "").split(",")[0]?.trim().toLowerCase();
  const expectedHosts = [...configured];
  if (headerHost) expectedHosts.push(headerHost);

  const origin = request.headers.get("origin");
  if (origin) {
    const originHost = hostFromUrl(origin);
    return expectedHosts.some((h) => hostsMatch(originHost, h));
  }

  const referer = request.headers.get("referer");
  if (referer) {
    const refererHost = hostFromUrl(referer);
    return expectedHosts.some((h) => hostsMatch(refererHost, h));
  }

  return false;
}
