/** Permanent public URL moves. Admin routes are not included. */

export const legacyPublicRedirects = [
  { source: "/bgmi-lite-apk", destination: "/bgmi-air-apk" },
  { source: "/bgmi-lite-redeem-code", destination: "/bgmi-air-redeem-code" },
  { source: "/bgmi-lite-stylish-name", destination: "/bgmi-air-stylish-name" },
  { source: "/bgmi-lite", destination: "/bgmi-air" },
  { source: "/pubg-mobile-lite-apk", destination: "/pubg-mobile-flash-apk" },
  { source: "/pubg-mobile-lite-redeem-code", destination: "/pubg-mobile-flash-redeem-code" },
  { source: "/pubg-mobile-lite-name", destination: "/pubg-mobile-flash-name" },
  { source: "/pubg-mobile-lite", destination: "/pubg-mobile-flash" },
  { source: "/news/bgmi-lite", destination: "/news/bgmi-air" },
  { source: "/news/pubg-mobile-lite", destination: "/news/pubg-mobile-flash" },
] as const;
