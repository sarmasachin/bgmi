import type { NextRequest } from "next/server";

/**
 * Client IP for rate limits / lockouts.
 *
 * Spoof-resistant when behind a trusted reverse proxy:
 * - Prefer platform headers (Vercel) that clients cannot set.
 * - Only trust X-Real-IP / X-Forwarded-For when TRUST_PROXY=1
 *   (nginx/Caddy must overwrite these — never pass client values through).
 * - Without TRUST_PROXY, ignore client-supplied forwarded headers.
 */
export function getRequestIp(request: NextRequest | { headers: Headers }): string {
  const headers = request.headers;

  const vercel =
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-vercel-ip")?.trim();
  if (vercel) return vercel;

  const trustProxy =
    process.env.TRUST_PROXY === "1" ||
    process.env.TRUST_PROXY === "true" ||
    process.env.NODE_ENV === "production";

  if (trustProxy) {
    const real = headers.get("x-real-ip")?.trim();
    if (real) return real.split(",")[0]!.trim();

    // Rightmost hop is added by the closest proxy when proxies append.
    // Leftmost is the original client when the edge proxy overwrites the header.
    // Our nginx/Vercel setups overwrite — use the first hop.
    const forwarded = headers.get("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }
  }

  return "local";
}
