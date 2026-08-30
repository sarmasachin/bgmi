/** IST calendar helpers for BGMI Lite redeem “updated today” UX. */

const IST = "Asia/Kolkata";

/** YYYY-MM-DD in Asia/Kolkata. */
export function istCalendarDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** True only when `updatedAt` falls on today’s IST calendar day. */
export function wasRedeemUpdatedTodayIst(updatedAt: Date | null | undefined): boolean {
  if (!updatedAt || Number.isNaN(updatedAt.getTime())) return false;
  return istCalendarDayKey(updatedAt) === istCalendarDayKey(new Date());
}

/** Public label e.g. "Updated 30 Aug, 02:40 PM IST". */
export function formatRedeemUpdatedLabelIst(
  updatedAt: Date,
  prefix = "Updated",
): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(updatedAt);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";

  const day = get("day");
  const month = get("month");
  const hour = get("hour");
  const minute = get("minute");
  const dayPeriod = get("dayPeriod").toUpperCase();
  const head = prefix.trim() || "Updated";
  return `${head} ${day} ${month}, ${hour}:${minute} ${dayPeriod} IST`;
}
