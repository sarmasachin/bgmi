/**
 * Safe <img> src for stored media.
 * Accepts a site path (`/uploads/a.jpg`) or an http(s) URL.
 * Bare text such as "qwdww" is rejected so the browser does not request it.
 */
export function publicImageSrc(raw?: string | null): string {
  const value = (raw ?? "").trim();
  if (!value || value.length > 2000) return "";
  if (value.startsWith("data:") || value.startsWith("blob:")) return "";
  if (value.startsWith("/") && !value.startsWith("//")) {
    if (value.toLowerCase().startsWith("/javascript:")) return "";
    return value;
  }
  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const url = new URL(value);
      if (url.protocol === "http:" || url.protocol === "https:") return url.href;
    } catch {
      return "";
    }
  }
  return "";
}
