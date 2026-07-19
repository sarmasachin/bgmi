/**
 * Helpers for admin-stored head snippets (verification / analytics / ads).
 * Never invent verification codes — only emit when configured.
 */

export type HeadSnippetsValue = {
  googleVerificationMeta?: string;
  analyticsScript?: string;
  adsenseScript?: string;
};

/** Extract Google Search Console content token from admin field. */
export function parseGoogleSiteVerification(raw: string | undefined | null): string | undefined {
  const s = (raw ?? "").trim();
  if (!s) return undefined;

  const fromContentAttr = s.match(/content\s*=\s*["']([^"']+)["']/i);
  if (fromContentAttr?.[1]?.trim()) return fromContentAttr[1].trim();

  const fromNameEq = s.match(/google-site-verification\s*=\s*([^\s"'<>]+)/i);
  if (fromNameEq?.[1]?.trim()) return fromNameEq[1].trim();

  // Bare token from Search Console
  if (/^[A-Za-z0-9_-]{12,}$/.test(s)) return s;

  return undefined;
}

/** Strip wrapping <script> tags if admin pasted full HTML. */
export function normalizeInlineScript(raw: string | undefined | null): string | undefined {
  let s = (raw ?? "").trim();
  if (!s) return undefined;
  s = s.replace(/^\s*<script[^>]*>/i, "").replace(/<\/script>\s*$/i, "").trim();
  return s || undefined;
}
