import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: ".next",
  devIndicators: false,
  serverExternalPackages: ["sharp"],
  async rewrites() {
    return [
      { source: "/api/admin/ads/placements", destination: "/api/admin/ad-units/placements" },
      { source: "/api/admin/ads", destination: "/api/admin/ad-units" },
    ];
  },
};

export default nextConfig;
