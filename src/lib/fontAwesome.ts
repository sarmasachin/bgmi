/** Font Awesome solid-only CDN (site uses fa-solid). */
export const FA_BASE = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0";

export const FA_CSS = [
  `${FA_BASE}/css/fontawesome.min.css`,
  `${FA_BASE}/css/solid.min.css`,
] as const;

export const FA_SOLID_WOFF2 = `${FA_BASE}/webfonts/fa-solid-900.woff2`;
