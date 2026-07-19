/**
 * Server-safe HTML sanitizer for article/page body content.
 * Strips scripts, event handlers, dangerous URLs; allows limited iframes.
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

  // Strip style expressions / javascript in style attrs.
  html = html.replace(/\sstyle\s*=\s*(["'])[\s\S]*?\1/gi, (match) => {
    if (/expression\s*\(|javascript\s*:|url\s*\(\s*['"]?\s*javascript/i.test(match)) {
      return "";
    }
    return match;
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
