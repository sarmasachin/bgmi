/**
 * Normalize notification click URL so bad input never breaks send.
 * Empty / invalid → "/". Relative paths and http(s) URLs allowed.
 */
export function normalizePushClickUrl(raw?: string | null): string {
  const fallback = "/";
  if (raw == null) return fallback;
  const value = String(raw).trim();
  if (!value) return fallback;
  if (value.length > 500) return fallback;
  if (/[\s\\]/.test(value) || value.includes("\0")) return fallback;

  if (value.startsWith("/") && !value.startsWith("//")) {
    if (value.toLowerCase().startsWith("/javascript:")) return fallback;
    return value;
  }

  try {
    const u = new URL(value);
    if (u.protocol !== "http:" && u.protocol !== "https:") return fallback;
    return u.href;
  } catch {
    return fallback;
  }
}
