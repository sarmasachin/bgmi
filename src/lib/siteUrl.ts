/** Canonical public site origin for sitemap, robots, and absolute SEO URLs. */

const PRODUCTION_SITE_URL = "https://sensitivitysettings.com";

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isLocalhostUrl(value: string): boolean {
  try {
    const { hostname } = new URL(value);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return /localhost|127\.0\.0\.1/i.test(value);
  }
}

/**
 * Public site URL used by robots.txt, sitemap.xml, and schema.
 * Production never emits localhost — even if env is missing or still set to local.
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fromEnv = raw && isAbsoluteHttpUrl(raw) ? stripTrailingSlash(raw) : "";

  if (process.env.NODE_ENV === "production") {
    if (fromEnv && !isLocalhostUrl(fromEnv)) return fromEnv;
    return PRODUCTION_SITE_URL;
  }

  if (fromEnv) return fromEnv;
  return "http://localhost:3000";
}

/**
 * Absolute canonical URL for a path or URL.
 * - "/" → https://site/
 * - "/news" → https://site/news
 * - localhost absolute URLs are rewritten to the public origin in production
 */
export function toCanonicalUrl(pathOrUrl: string = "/"): string {
  const base = getSiteUrl();
  const raw = pathOrUrl.trim();
  if (!raw || raw === "/") return `${base}/`;

  if (isAbsoluteHttpUrl(raw)) {
    const parsed = new URL(raw);
    const path = parsed.pathname.replace(/\/+$/, "") || "/";
    const suffix = `${path === "/" ? "/" : path}${parsed.search}`;
    if (isLocalhostUrl(raw)) return `${base}${suffix === "/" ? "/" : suffix}`;
    return `${parsed.origin}${suffix === "/" ? "/" : suffix}`;
  }

  const path = raw.startsWith("/") ? raw : `/${raw}`;
  const normalized = path.replace(/\/+$/, "") || "/";
  return normalized === "/" ? `${base}/` : `${base}${normalized}`;
}
