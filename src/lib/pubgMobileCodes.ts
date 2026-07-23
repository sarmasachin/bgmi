export const PUBG_MOBILE_CODES_PATH = "/pubg-mobile-codes";
export const PUBG_MOBILE_CODES_LABEL = "PUBG Mobile Code";

/** Stable SEO title — does not change daily (date shown separately on the page). */
export const PUBG_MOBILE_CODES_PAGE_TITLE = "PUBG Mobile Sensitivity Settings Code";

/** Visible “Updated …” label in IST (not used in <title>/H1). */
export function pubgMobileCodesUpdatedLabel(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(now);
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  return `Updated ${day} ${month} ${year}`;
}

/** ISO date (IST calendar day) for schema dateModified. */
export function pubgMobileCodesDateModifiedIso(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

/** Preset rows shown under the selected phone (no "Baseline" in names). */
export const PUBG_PRESET_CODE_ROWS: Array<{
  id: string;
  codeName: string;
  /** When true, code format is 1-####-####-####-####-### */
  prefixed?: boolean;
}> = [
  { id: "balanced", codeName: "Balanced All-Rounder" },
  { id: "tablet", codeName: "Tablet / iPad", prefixed: true },
  { id: "gyro", codeName: "Gyro Stability", prefixed: true },
  { id: "non-gyro", codeName: "Non-gyro", prefixed: true },
];

/** 19-digit code as ####-####-####-####-### */
export function generateYourMobileCode(): string {
  const digits: number[] = [];
  for (let i = 0; i < 19; i += 1) {
    digits.push(Math.floor(Math.random() * 10));
  }
  const raw = digits.join("");
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 19)}`;
}

/** Prefixed style: 1-####-####-####-####-### */
export function generatePrefixedPubgCode(): string {
  return `1-${generateYourMobileCode()}`;
}

export function buildFreshPresetCodes(): Array<{ id: string; codeName: string; code: string }> {
  return PUBG_PRESET_CODE_ROWS.map((row) => ({
    id: row.id,
    codeName: row.codeName,
    code: row.prefixed ? generatePrefixedPubgCode() : generateYourMobileCode(),
  }));
}

/** Merge PUBG Mobile Code nav link if missing from saved settings. */
export function ensurePubgMobileCodesNavigation(
  links: Array<{ label: string; href: string }>,
): Array<{ label: string; href: string }> {
  const out = [...links];
  const has = out.some(
    (row) =>
      row.href === PUBG_MOBILE_CODES_PATH ||
      row.href === PUBG_MOBILE_CODES_PATH.replace(/^\//, "") ||
      /pubg\s*mobile\s*code/i.test(row.label),
  );
  if (!has) {
    const pubgIdx = out.findIndex(
      (row) => row.href === "/pubg" || /^pubg\s*mobile$/i.test(row.label.trim()),
    );
    const item = { label: PUBG_MOBILE_CODES_LABEL, href: PUBG_MOBILE_CODES_PATH };
    if (pubgIdx >= 0) out.splice(pubgIdx + 1, 0, item);
    else out.push(item);
  }
  return out;
}
