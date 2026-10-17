/** PUBG Mobile Flash calculator path + family menu helpers. */

import { renameLiteDisplayLabel } from "@/src/lib/renameLiteDisplayNames";

export const PUBG_MOBILE_LITE_PATH = "/pubg-mobile-lite";
export const PUBG_MOBILE_LITE_LABEL = "PUBG Mobile Flash";
export const BGMI_AIR_LABEL = "BGMI Air";
export const BGMI_LITE_PATH = "/bgmi-lite";

/** Lite-family routes (header menu on these pages). */
export const PUBG_MOBILE_LITE_APK_PATH = "/pubg-mobile-lite-apk";
export const PUBG_MOBILE_LITE_REDEEM_CODE_PATH = "/pubg-mobile-lite-redeem-code";
export const PUBG_MOBILE_LITE_NAME_PATH = "/pubg-mobile-lite-name";

export const PUBG_MOBILE_LITE_FAMILY_PATHS = [
  PUBG_MOBILE_LITE_PATH,
  PUBG_MOBILE_LITE_APK_PATH,
  PUBG_MOBILE_LITE_REDEEM_CODE_PATH,
  PUBG_MOBILE_LITE_NAME_PATH,
] as const;

export function isPubgMobileLiteFamilyPath(pathname: string): boolean {
  const raw = typeof pathname === "string" ? pathname.trim() : "";
  const p = raw.replace(/\/+$/, "") || "/";
  if (p === "/news/pubg-mobile-lite" || p.startsWith("/news/pubg-mobile-lite/")) {
    return true;
  }
  return PUBG_MOBILE_LITE_FAMILY_PATHS.some(
    (base) => p === base || p.startsWith(`${base}/`),
  );
}

/** Header menu on /pubg-mobile-lite (and related Lite pages) — only these links. */
export const PUBG_MOBILE_LITE_NAV: Array<{ label: string; href: string }> = [
  { label: "Home", href: PUBG_MOBILE_LITE_PATH },
  { label: "PUBG Flash APK", href: PUBG_MOBILE_LITE_APK_PATH },
  { label: "Redeem Code", href: PUBG_MOBILE_LITE_REDEEM_CODE_PATH },
  { label: "PUBG Flash Name", href: PUBG_MOBILE_LITE_NAME_PATH },
  { label: "News", href: "/news/pubg-mobile-lite" },
];

function normHref(href: string): string {
  const t = href.trim();
  if (!t) return t;
  if (/^(https?:|mailto:|tel:|#)/i.test(t)) return t;
  return t.startsWith("/") ? t.replace(/\/+$/, "") || "/" : `/${t.replace(/\/+$/, "")}`;
}

/** Normalize Lite→Air/Flash labels and ensure PUBG Mobile Flash nav link exists. */
export function ensurePubgMobileLiteNavigation(
  links: Array<{ label: string; href: string }>,
): Array<{ label: string; href: string }> {
  const out = links.map((row) => {
    const href = normHref(row.href);
    let label = renameLiteDisplayLabel(row.label);
    if (href === BGMI_LITE_PATH || /^bgmi\s*lite$/i.test(row.label.trim())) {
      label = BGMI_AIR_LABEL;
    }
    if (
      href === PUBG_MOBILE_LITE_PATH ||
      /pubg\s*mobile\s*(lite|flash)/i.test(row.label) ||
      /^pubg\s*lite$/i.test(row.label.trim())
    ) {
      label = PUBG_MOBILE_LITE_LABEL;
    }
    return { ...row, label, href: href || row.href };
  });

  const has = out.some(
    (row) =>
      normHref(row.href) === PUBG_MOBILE_LITE_PATH ||
      /pubg\s*mobile\s*(lite|flash)/i.test(row.label),
  );
  if (has) return out;

  const pubgIdx = out.findIndex(
    (row) =>
      normHref(row.href) === "/pubg" ||
      /^pubg(\s*mobile)?$/i.test(row.label.trim()),
  );
  const entry = { label: PUBG_MOBILE_LITE_LABEL, href: PUBG_MOBILE_LITE_PATH };
  if (pubgIdx >= 0) {
    out.splice(pubgIdx + 1, 0, entry);
    return out;
  }
  out.push(entry);
  return out;
}
