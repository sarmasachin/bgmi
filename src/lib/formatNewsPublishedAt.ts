/** Pick the newest of published / updated / created for public date labels. */
export function latestNewsDateValue(item: {
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
  createdAt?: Date | string | null;
}): Date | string | null {
  const values = [item.publishedAt, item.updatedAt, item.createdAt];
  let latest: Date | null = null;
  for (const value of values) {
    if (!value) continue;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) continue;
    if (!latest || date.getTime() > latest.getTime()) latest = date;
  }
  return latest;
}

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
