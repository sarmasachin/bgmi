/** React `key` for RatingWidget — safe to import from Server Components (no "use client"). */
export function ratingWidgetRemountKey(
  targetType: "home" | "news" | "tool",
  targetId?: string,
) {
  return `${targetType}:${targetId ?? "home"}`;
}
