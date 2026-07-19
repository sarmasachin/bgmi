import type { NextConfig } from "next";
import path from "path";

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
  async rewrites() {
    return [
      { source: "/api/admin/ads/placements", destination: "/api/admin/ad-units/placements" },
      { source: "/api/admin/ads", destination: "/api/admin/ad-units" },
    ];
  },
};

export default nextConfig;
