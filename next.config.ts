import type { NextConfig } from "next";
import path from "path";

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Intentionally narrow: analytics/adsense need inline scripts; block framing + plugins.
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'",
  },
];

if (process.env.NODE_ENV === "production") {
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  distDir: ".next",
  // Avoid picking C:\Users\DELL\package-lock.json as the workspace root.
  outputFileTracingRoot: path.join(__dirname),
  devIndicators: false,
  serverExternalPackages: ["sharp"],
  experimental: {
    // Drop render-blocking <link rel="stylesheet"> in production (inline into HTML).
    inlineCss: true,
  },
  webpack(config) {
    // Strip Next.js legacy client polyfills (Array.at, Object.hasOwn, etc.) —
    // not needed for modern browsers; clears Lighthouse "Legacy JavaScript".
    const empty = path.join(__dirname, "src/lib/empty-module.js");
    config.resolve.alias = {
      ...config.resolve.alias,
      "../build/polyfills/polyfill-module": empty,
      "next/dist/build/polyfills/polyfill-module": empty,
      "next/dist/build/polyfills/polyfill-module.js": empty,
    };
    return config;
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, private, max-age=0",
          },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/api/admin/ads/placements", destination: "/api/admin/ad-units/placements" },
      { source: "/api/admin/ads", destination: "/api/admin/ad-units" },
    ];
  },
};

export default nextConfig;
