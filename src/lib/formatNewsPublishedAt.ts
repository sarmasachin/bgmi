/** Format news publish time for public UI: `Aug 01, 2026 00:00 IST` */
export function formatNewsPublishedAtIst(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const month = get("month");
  const day = get("day");
  const year = get("year");
  let hour = get("hour");
  const minute = get("minute");
  // Some engines emit "24" for midnight with hour12: false.
  if (hour === "24") hour = "00";

  return `${month} ${day}, ${year} ${hour}:${minute} IST`;
}
