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

/** Sync ISO ↔ formatted labels before save / after normalize. */
export function finalizeRedeemScheduleDraft<T extends RedeemScheduleDraft>(draft: T): T {
  if (draft.status === "live") {
    const hasReleasedIso = isValidRedeemScheduleIso(draft.releasedAt);
    const hasExpiresIso = isValidRedeemScheduleIso(draft.expiresAt);
    const hasLegacyLabels =
      Boolean(draft.releasedLabel?.trim()) || Boolean(draft.expiresLabel?.trim());

    if (hasReleasedIso && hasExpiresIso) {
      return {
        ...draft,
        releasedLabel: formatRedeemReleasedLabel(draft.releasedAt),
        expiresLabel: formatRedeemExpiresLabel(draft.expiresAt),
        expiredOnAt: undefined,
        expiredOnLabel: undefined,
      };
    }

    if (hasReleasedIso) {
      const expiresAt = hasExpiresIso ? draft.expiresAt! : defaultExpiresIso(draft.releasedAt);
      return {
        ...draft,
        expiresAt,
        releasedLabel: formatRedeemReleasedLabel(draft.releasedAt),
        expiresLabel: formatRedeemExpiresLabel(expiresAt),
        expiredOnAt: undefined,
        expiredOnLabel: undefined,
      };
    }

    if (hasExpiresIso) {
      const releasedAt = defaultReleasedIso();
      return {
        ...draft,
        releasedAt,
        releasedLabel: formatRedeemReleasedLabel(releasedAt),
        expiresLabel: formatRedeemExpiresLabel(draft.expiresAt),
        expiredOnAt: undefined,
        expiredOnLabel: undefined,
      };
    }

    if (hasLegacyLabels) {
      return {
        ...draft,
        expiredOnAt: undefined,
        expiredOnLabel: undefined,
      };
    }

    const releasedAt = defaultReleasedIso();
    const expiresAt = defaultExpiresIso(releasedAt);
    return {
      ...draft,
      releasedAt,
      expiresAt,
      releasedLabel: formatRedeemReleasedLabel(releasedAt),
      expiresLabel: formatRedeemExpiresLabel(expiresAt),
      expiredOnAt: undefined,
      expiredOnLabel: undefined,
    };
  }

  if (isValidRedeemScheduleIso(draft.expiredOnAt)) {
    return {
      ...draft,
      expiredOnLabel: formatRedeemExpiredOnLabel(draft.expiredOnAt),
      releasedAt: undefined,
      expiresAt: undefined,
      releasedLabel: undefined,
      expiresLabel: undefined,
    };
  }

  if (draft.expiredOnLabel?.trim()) {
    return {
      ...draft,
      releasedAt: undefined,
      expiresAt: undefined,
      releasedLabel: undefined,
      expiresLabel: undefined,
    };
  }

  const expiredOnAt = defaultReleasedIso();
  return {
    ...draft,
    expiredOnAt,
    expiredOnLabel: formatRedeemExpiredOnLabel(expiredOnAt),
    releasedAt: undefined,
    expiresAt: undefined,
    releasedLabel: undefined,
    expiresLabel: undefined,
  };
}

/** Attach schedule ISO + labels when reading from DB JSON. */
export function attachRedeemScheduleFromRaw(
  item: RedeemScheduleDraft,
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
}
