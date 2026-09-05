/** IST date/time helpers for redeem-code admin + public labels. */

const IST = "Asia/Kolkata";

export type RedeemScheduleDraft = {
  status: "live" | "expired";
  releasedAt?: string;
  expiresAt?: string;
  expiredOnAt?: string;
  releasedLabel?: string;
  expiresLabel?: string;
  expiredOnLabel?: string;
};

function istParts(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
}

function part(parts: Intl.DateTimeFormatPart[], type: string) {
  return parts.find((p) => p.type === type)?.value ?? "";
}

/** Split ISO (or parseable date) into `<input type="date">` + `<input type="time">` (IST). */
export function splitRedeemScheduleIso(iso: string | undefined): { date: string; time: string } {
  const fallback = { date: "", time: "12:00" };
  if (!iso?.trim()) return fallback;
  const ms = Date.parse(iso.trim());
  if (!Number.isFinite(ms)) return fallback;
  const parts = istParts(new Date(ms));
  let hour = part(parts, "hour");
  if (hour === "24") hour = "00";
  return {
    date: `${part(parts, "year")}-${part(parts, "month")}-${part(parts, "day")}`,
    time: `${hour}:${part(parts, "minute")}`,
  };
}

/** Join date + time fields into ISO string with IST offset. */
export function joinRedeemScheduleIso(date: string, time: string): string {
  const safeDate = date.trim();
  const safeTime = (time.trim() || "12:00").slice(0, 5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(safeDate)) return "";
  if (!/^\d{2}:\d{2}$/.test(safeTime)) return `${safeDate}T12:00:00+05:30`;
  return `${safeDate}T${safeTime}:00+05:30`;
}

function formatScheduleDisplay(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(ms));
}

export function formatRedeemReleasedLabel(iso: string): string {
  return `Released: ${formatScheduleDisplay(iso)} IST`;
}

export function formatRedeemExpiresLabel(iso: string): string {
  return `Expires: ${formatScheduleDisplay(iso)} IST`;
}

export function formatRedeemExpiredOnLabel(iso: string): string {
  return `Expired on: ${formatScheduleDisplay(iso)} IST`;
}

/** Now in IST as ISO (+05:30). */
export function defaultReleasedIso(): string {
  const now = new Date();
  const { date, time } = splitRedeemScheduleIso(now.toISOString());
  return joinRedeemScheduleIso(date, time);
}

/** Default expiry: 7 days after release, 23:59 IST. */
export function defaultExpiresIso(releasedIso?: string): string {
  const baseMs = releasedIso && Number.isFinite(Date.parse(releasedIso))
    ? Date.parse(releasedIso)
    : Date.now();
  const expiry = new Date(baseMs + 7 * 24 * 60 * 60 * 1000);
  const { date } = splitRedeemScheduleIso(expiry.toISOString());
  return joinRedeemScheduleIso(date, "23:59");
}

export function isValidRedeemScheduleIso(iso: string | undefined): iso is string {
  return Boolean(iso?.trim() && Number.isFinite(Date.parse(iso)));
}

function redeemScheduleMs(iso: string | undefined): number {
  if (!isValidRedeemScheduleIso(iso)) return 0;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : 0;
}

/** Public archive: most recently expired code first. */
export function sortExpiredRedeemCodesNewestFirst<T extends RedeemScheduleDraft>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const bMs =
      redeemScheduleMs(b.expiredOnAt) || redeemScheduleMs(b.expiresAt) || redeemScheduleMs(b.releasedAt);
    const aMs =
      redeemScheduleMs(a.expiredOnAt) || redeemScheduleMs(a.expiresAt) || redeemScheduleMs(a.releasedAt);
    return bMs - aMs;
  });
}

/** Fresh live-code schedule defaults for admin “Add code”. */
export function defaultLiveRedeemSchedule(): Pick<
  RedeemScheduleDraft,
  "releasedAt" | "expiresAt" | "releasedLabel" | "expiresLabel"
> {
  const releasedAt = defaultReleasedIso();
  const expiresAt = defaultExpiresIso(releasedAt);
  return {
    releasedAt,
    expiresAt,
    releasedLabel: formatRedeemReleasedLabel(releasedAt),
    expiresLabel: formatRedeemExpiresLabel(expiresAt),
  };
}

/** Fresh expired-code schedule defaults for admin. */
export function defaultExpiredRedeemSchedule(): Pick<
  RedeemScheduleDraft,
  "expiredOnAt" | "expiredOnLabel"
> {
  const expiredOnAt = defaultReleasedIso();
  return {
    expiredOnAt,
    expiredOnLabel: formatRedeemExpiredOnLabel(expiredOnAt),
  };
}

export type RedeemCodeWithStatus = RedeemScheduleDraft & {
  status: "live" | "expired";
};

/** Flip live → expired when admin-set expiresAt is in the past (IST ISO). */
export function applyAutoExpireRedeemCode<T extends RedeemCodeWithStatus>(
  item: T,
  nowMs: number = Date.now(),
): T {
  if (item.status === "expired") return item;
  if (!isValidRedeemScheduleIso(item.expiresAt)) return item;
  const expiresMs = Date.parse(item.expiresAt);
  if (!Number.isFinite(expiresMs) || expiresMs > nowMs) return item;

  const expiredOnAt = item.expiresAt;
  return {
    ...item,
    status: "expired",
    expiredOnAt,
    expiredOnLabel: formatRedeemExpiredOnLabel(expiredOnAt),
    releasedAt: undefined,
    expiresAt: undefined,
    releasedLabel: undefined,
    expiresLabel: undefined,
  };
}

/** Live in DB but Released time is still in the future → scheduled (not public yet). */
export function isRedeemCodeScheduled(
  item: RedeemCodeWithStatus,
  nowMs: number = Date.now(),
): boolean {
  if (item.status !== "live") return false;
  if (!isValidRedeemScheduleIso(item.releasedAt)) return false;
  const releasedMs = Date.parse(item.releasedAt);
  return Number.isFinite(releasedMs) && releasedMs > nowMs;
}

/** Public “active” live: not expired and not waiting on future Released. */
export function isRedeemCodePubliclyLive(
  item: RedeemCodeWithStatus,
  nowMs: number = Date.now(),
): boolean {
  const next = applyAutoExpireRedeemCode(item, nowMs);
  if (next.status !== "live") return false;
  return !isRedeemCodeScheduled(next, nowMs);
}

/**
 * Ensure edit modal has date/time picker values (ISO), even for legacy label-only rows.
 */
export function hydrateRedeemScheduleForEdit<T extends RedeemCodeWithStatus>(item: T): T {
  if (item.status === "expired") {
    if (isValidRedeemScheduleIso(item.expiredOnAt)) {
      return {
        ...item,
        expiredOnLabel: formatRedeemExpiredOnLabel(item.expiredOnAt),
      };
    }
    const expiredOnAt = defaultReleasedIso();
    return {
      ...item,
      expiredOnAt,
      expiredOnLabel: item.expiredOnLabel?.trim() || formatRedeemExpiredOnLabel(expiredOnAt),
      releasedAt: undefined,
      expiresAt: undefined,
      releasedLabel: undefined,
      expiresLabel: undefined,
    };
  }

  const defaults = defaultLiveRedeemSchedule();
  const releasedAt = isValidRedeemScheduleIso(item.releasedAt)
    ? item.releasedAt
    : defaults.releasedAt!;
  const expiresAt = isValidRedeemScheduleIso(item.expiresAt)
    ? item.expiresAt
    : defaults.expiresAt!;
  return {
    ...item,
    releasedAt,
    expiresAt,
    releasedLabel: formatRedeemReleasedLabel(releasedAt),
    expiresLabel: formatRedeemExpiresLabel(expiresAt),
    expiredOnAt: undefined,
    expiredOnLabel: undefined,
  };
}

/** Sync ISO ↔ formatted labels before save / after normalize. */
export function finalizeRedeemScheduleDraft<T extends RedeemScheduleDraft>(draft: T): T {
  let next: T;

  if (draft.status === "live") {
    const releasedAtRaw = draft.releasedAt;
    const expiresAtRaw = draft.expiresAt;
    const hasReleasedIso = isValidRedeemScheduleIso(releasedAtRaw);
    const hasExpiresIso = isValidRedeemScheduleIso(expiresAtRaw);
    const hasLegacyLabels =
      Boolean(draft.releasedLabel?.trim()) || Boolean(draft.expiresLabel?.trim());

    if (hasReleasedIso && hasExpiresIso) {
      next = {
        ...draft,
        releasedLabel: formatRedeemReleasedLabel(releasedAtRaw),
        expiresLabel: formatRedeemExpiresLabel(expiresAtRaw),
        expiredOnAt: undefined,
        expiredOnLabel: undefined,
      };
    } else if (hasReleasedIso) {
      const expiresAt = hasExpiresIso ? expiresAtRaw : defaultExpiresIso(releasedAtRaw);
      next = {
        ...draft,
        expiresAt,
        releasedLabel: formatRedeemReleasedLabel(releasedAtRaw),
        expiresLabel: formatRedeemExpiresLabel(expiresAt),
        expiredOnAt: undefined,
        expiredOnLabel: undefined,
      };
    } else if (hasExpiresIso) {
      const releasedAt = defaultReleasedIso();
      next = {
        ...draft,
        releasedAt,
        releasedLabel: formatRedeemReleasedLabel(releasedAt),
        expiresLabel: formatRedeemExpiresLabel(expiresAtRaw),
        expiredOnAt: undefined,
        expiredOnLabel: undefined,
      };
    } else if (hasLegacyLabels) {
      next = {
        ...draft,
        expiredOnAt: undefined,
        expiredOnLabel: undefined,
      };
    } else {
      const releasedAt = defaultReleasedIso();
      const expiresAt = defaultExpiresIso(releasedAt);
      next = {
        ...draft,
        releasedAt,
        expiresAt,
        releasedLabel: formatRedeemReleasedLabel(releasedAt),
        expiresLabel: formatRedeemExpiresLabel(expiresAt),
        expiredOnAt: undefined,
        expiredOnLabel: undefined,
      };
    }
  } else if (isValidRedeemScheduleIso(draft.expiredOnAt)) {
    next = {
      ...draft,
      expiredOnLabel: formatRedeemExpiredOnLabel(draft.expiredOnAt),
      releasedAt: undefined,
      expiresAt: undefined,
      releasedLabel: undefined,
      expiresLabel: undefined,
    };
  } else if (draft.expiredOnLabel?.trim()) {
    next = {
      ...draft,
      releasedAt: undefined,
      expiresAt: undefined,
      releasedLabel: undefined,
      expiresLabel: undefined,
    };
  } else {
    const expiredOnAt = defaultReleasedIso();
    next = {
      ...draft,
      expiredOnAt,
      expiredOnLabel: formatRedeemExpiredOnLabel(expiredOnAt),
      releasedAt: undefined,
      expiresAt: undefined,
      releasedLabel: undefined,
      expiresLabel: undefined,
    };
  }

  return applyAutoExpireRedeemCode(next as T & RedeemCodeWithStatus);
}

export function compactRedeemScheduleLabel(label: string | undefined): string {
  if (!label?.trim()) return "—";
  const trimmed = label
    .trim()
    .replace(/^Released:\s*/i, "")
    .replace(/^Expires:\s*/i, "")
    .replace(/^Expired on:\s*/i, "")
    .replace(/\s+IST$/i, "")
    .trim();
  return trimmed || "—";
}

/** Attach schedule ISO + labels when reading from DB JSON. */
export function attachRedeemScheduleFromRaw(
  item: RedeemScheduleDraft & { status?: "live" | "expired" },
  raw: Record<string, unknown>,
  sanitizeString: (value: unknown, fallback?: string) => string,
) {
  const releasedAt = sanitizeString(raw.releasedAt);
  const expiresAt = sanitizeString(raw.expiresAt);
  const expiredOnAt = sanitizeString(raw.expiredOnAt);
  const releasedLabel = sanitizeString(raw.releasedLabel);
  const expiresLabel = sanitizeString(raw.expiresLabel);
  const expiredOnLabel = sanitizeString(raw.expiredOnLabel);

  if (isValidRedeemScheduleIso(releasedAt)) {
    item.releasedAt = releasedAt;
    item.releasedLabel = formatRedeemReleasedLabel(releasedAt);
  } else if (releasedLabel) {
    item.releasedLabel = releasedLabel;
  }

  if (isValidRedeemScheduleIso(expiresAt)) {
    item.expiresAt = expiresAt;
    item.expiresLabel = formatRedeemExpiresLabel(expiresAt);
  } else if (expiresLabel) {
    item.expiresLabel = expiresLabel;
  }

  if (isValidRedeemScheduleIso(expiredOnAt)) {
    item.expiredOnAt = expiredOnAt;
    item.expiredOnLabel = formatRedeemExpiredOnLabel(expiredOnAt);
  } else if (expiredOnLabel) {
    item.expiredOnLabel = expiredOnLabel;
  }

  if (item.status === "live" || item.status === "expired") {
    const next = applyAutoExpireRedeemCode(item as RedeemCodeWithStatus);
    item.status = next.status;
    item.expiredOnAt = next.expiredOnAt;
    item.expiredOnLabel = next.expiredOnLabel;
    item.releasedAt = next.releasedAt;
    item.expiresAt = next.expiresAt;
    item.releasedLabel = next.releasedLabel;
    item.expiresLabel = next.expiresLabel;
  }
}
