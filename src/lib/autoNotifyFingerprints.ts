import {
  isRedeemCodePubliclyLive,
  type RedeemCodeWithStatus,
} from "@/src/lib/redeemCodeSchedule";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

type Redeemish = RedeemCodeWithStatus & { code?: string; title?: string };

function asRedeemItems(codes: unknown): Redeemish[] {
  if (!Array.isArray(codes)) return [];
  const out: Redeemish[] = [];
  for (const row of codes) {
    if (!isPlainObject(row)) continue;
    if (row.status !== "live" && row.status !== "expired") continue;
    out.push({
      status: row.status,
      releasedAt: text(row.releasedAt) || undefined,
      expiresAt: text(row.expiresAt) || undefined,
      expiredOnAt: text(row.expiredOnAt) || undefined,
      code: text(row.code),
      title: text(row.title),
    });
  }
  return out;
}

/** Publicly live codes only — SEO/archive edits do not change this. */
export function redeemLiveFingerprint(codes: unknown): string {
  const live = asRedeemItems(codes)
    .filter((item) => isRedeemCodePubliclyLive(item))
    .map((item) => `${item.code}|${item.title}`)
    .sort();
  return JSON.stringify(live);
}

export function advanceServerFingerprint(page: unknown): string {
  const row = isPlainObject(page) ? page : {};
  const countdown = isPlainObject(row.countdown) ? row.countdown : {};
  return JSON.stringify({
    heroTitle: text(row.heroTitle),
    apkCta: text(row.apkCta),
    officialUrl: text(row.officialUrl),
    label: text(countdown.label),
    targetIso: text(countdown.targetIso),
    dateText: text(countdown.dateText),
  });
}

export function stylishNamesFingerprint(page: unknown): string {
  const row = isPlainObject(page) ? page : {};
  const groups = Array.isArray(row.ideaGroups) ? row.ideaGroups : [];
  const names: string[] = [];
  for (const group of groups) {
    if (!isPlainObject(group) || !Array.isArray(group.items)) continue;
    for (const item of group.items) {
      if (!isPlainObject(item)) continue;
      const value = text(item.value);
      if (value) names.push(value);
    }
  }
  if (names.length) return JSON.stringify(names.slice().sort());
  return JSON.stringify({
    title: text(row.title),
    subtitle: text(row.subtitle),
    steps: Array.isArray(row.steps) ? row.steps : [],
  });
}

export function liteApkFingerprint(page: unknown): string {
  const row = isPlainObject(page) ? page : {};
  const countdown = isPlainObject(row.countdown) ? row.countdown : {};
  return JSON.stringify({
    heroTitle: text(row.heroTitle),
    label: text(countdown.label),
    targetIso: text(countdown.targetIso),
    dateText: text(countdown.dateText),
    liveMessage: text(countdown.liveMessage),
  });
}
