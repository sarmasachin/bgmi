/**
 * Server-safe HTML sanitizer for article/page body content.
 * Strips scripts, event handlers, dangerous URLs; allows limited iframes.
 * Also strips editor/paste white-text traps (`<font color>`, inline color styles)
 * that hide body text on the light article background.
 */
export function sanitizeHtml(raw: string): string {
  if (!raw) return "";
  let html = raw;

  // Remove blocked tags (including content where relevant).
  html = html.replace(/<(script|style|object|embed|form|meta|link|base)(\s[^>]*)?>[\s\S]*?<\/\1>/gi, "");
  html = html.replace(/<(script|style|object|embed|form|meta|link|base)(\s[^>]*)?\/?>/gi, "");

  // Drop event-handler attributes.
  html = html.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Neutralize javascript: / vbscript: / data:text/html in href/src/xlink:href/action.
  html = html.replace(
    /\s(href|src|xlink:href|action)\s*=\s*(["'])\s*(javascript|vbscript|data)\s*:/gi,
    ' $1=$2#blocked:',
  );

  // Unwrap <font>…</font> (keep children). Editor foreColor often wraps list text in
  // <font color="#ffffff"> which is invisible on the white news reader.
  for (let i = 0; i < 20; i++) {
    const next = html.replace(/<font\b[^>]*>([\s\S]*?)<\/font>/gi, "$1");
    if (next === html) break;
    html = next;
  }
  html = html.replace(/<\/?font\b[^>]*>/gi, "");

  // Strip leftover color attrs from any tag.
  html = html.replace(/\s(?:color|bgcolor|face|size)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Strip style expressions / javascript in style attrs, and drop text color styles
  // that hide content on the light article page (keep bold/italic via tags).
  html = html.replace(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/gi, (_match, quote: string, style: string) => {
    if (/expression\s*\(|javascript\s*:|url\s*\(\s*['"]?\s*javascript/i.test(style)) {
      return "";
    }
    const kept = style
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => {
        const prop = part.split(":")[0]?.trim().toLowerCase() ?? "";
        if (!prop) return false;
        if (
          prop === "color" ||
          prop === "background" ||
          prop === "background-color" ||
          prop === "-webkit-text-fill-color" ||
          prop === "caret-color" ||
          prop === "text-decoration-color"
        ) {
          return false;
        }
        return true;
      });
    if (kept.length === 0) return "";
    return ` style=${quote}${kept.join("; ")}${quote}`;
  });

  // iframe: keep only YouTube / Vimeo embeds.
  html = html.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, (tag) => {
    const srcMatch = tag.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);
    const src = srcMatch?.[2] ?? "";
    const allowed =
      src.includes("youtube.com/embed/") ||
      src.includes("youtube-nocookie.com/embed/") ||
      src.includes("player.vimeo.com/video/");
    return allowed ? tag : "";
  });
  html = html.replace(/<iframe\b[^>]*\/?>/gi, (tag) => {
    if (/<\/iframe>/i.test(tag)) return tag;
    const srcMatch = tag.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);
    const src = srcMatch?.[2] ?? "";
    const allowed =
      src.includes("youtube.com/embed/") ||
      src.includes("youtube-nocookie.com/embed/") ||
      src.includes("player.vimeo.com/video/");
    return allowed ? tag : "";
  });

  return html;
}
