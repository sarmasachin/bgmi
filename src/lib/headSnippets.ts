/**
 * Helpers for admin-stored head snippets (verification / analytics / ads).
 * Never invent verification codes — only emit when configured.
 */

export type HeadSnippetsValue = {
  googleVerificationMeta?: string;
  analyticsScript?: string;
  adsenseScript?: string;
};

export type ParsedAnalyticsSnippet = {
  measurementId?: string;
  /** External gtag.js URL (loaded via next/script src). */
  externalSrc?: string;
  /** Inline init / config JS (no nested <script> tags). */
  inlineJs?: string;
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

function buildGtagInline(measurementId: string): string {
  const id = measurementId.trim();
  return (
    `window.dataLayer = window.dataLayer || [];\n` +
    `function gtag(){dataLayer.push(arguments);}\n` +
    `gtag('js', new Date());\n` +
    `gtag('config', '${id}');`
  );
}

function stripHtmlNoise(js: string): string {
  return js
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?script\b[^>]*>/gi, "")
    .trim();
}

/**
 * Parse admin Analytics Script field into:
 * - external googletagmanager src (proper next/script)
 * - clean inline gtag config (no nested script tags)
 *
 * Accepts: full Google tag HTML, bare G-XXXX id, or inline JS only.
 */
export function parseAnalyticsSnippet(
  raw: string | undefined | null
): ParsedAnalyticsSnippet | undefined {
  const s = (raw ?? "").trim();
  if (!s) return undefined;

  // Bare measurement ID only
  if (/^G-[A-Z0-9]+$/i.test(s)) {
    const measurementId = s.toUpperCase();
    return {
      measurementId,
      externalSrc: `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
      inlineJs: buildGtagInline(measurementId),
    };
  }

  const idMatch = s.match(/\b(G-[A-Z0-9]+)\b/i);
  const measurementId = idMatch?.[1]?.toUpperCase();

  const srcFromTag = s.match(
    /<script[^>]*\bsrc\s*=\s*["'](https:\/\/www\.googletagmanager\.com\/gtag\/js\?[^"']+)["'][^>]*>\s*<\/script>/i
  );
  const srcLoose = s.match(
    /(https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-[A-Z0-9]+)/i
  );
  const externalSrc =
    srcFromTag?.[1] ||
    srcLoose?.[1] ||
    (measurementId
      ? `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
      : undefined);

  const inlineParts: string[] = [];
  const inlineScriptRe = /<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = inlineScriptRe.exec(s)) !== null) {
    const body = m[1]?.trim();
    if (body) inlineParts.push(body);
  }

  let inlineJs = inlineParts.join("\n").trim();
  if (!inlineJs) {
    // No HTML script tags — treat as raw JS (or broken paste after old normalizer).
    inlineJs = stripHtmlNoise(normalizeInlineScript(s) ?? s);
  } else {
    inlineJs = stripHtmlNoise(inlineJs);
  }

  if (measurementId && (!inlineJs || !/\bgtag\s*\(/.test(inlineJs))) {
    inlineJs = buildGtagInline(measurementId);
  }

  if (!externalSrc && !inlineJs) return undefined;

  return {
    measurementId,
    externalSrc,
    inlineJs: inlineJs || undefined,
  };
}

export type ParsedAdsenseSnippet = {
  clientId?: string;
  /** pagead adsbygoogle.js URL */
  externalSrc?: string;
  /** AdSense script uses crossorigin="anonymous" */
  crossOrigin?: boolean;
  inlineJs?: string;
};

/**
 * Parse admin AdSense Script field.
 * Accepts: full AdSense <script src=...> HTML, bare ca-pub-XXXX, or inline JS.
 */
export function parseAdsenseSnippet(
  raw: string | undefined | null
): ParsedAdsenseSnippet | undefined {
  const s = (raw ?? "").trim();
  if (!s) return undefined;

  if (/^ca-pub-\d+$/i.test(s)) {
    const clientId = s.toLowerCase();
    return {
      clientId,
      externalSrc: `https://pagead2.googlesyndication.com/pagead/adsbygoogle.js?client=${clientId}`,
      crossOrigin: true,
    };
  }

  const clientMatch = s.match(/\b(ca-pub-\d+)\b/i);
  const clientId = clientMatch?.[1]?.toLowerCase();

  const srcTag = s.match(
    /<script([^>]*)\bsrc\s*=\s*["'](https:\/\/pagead2\.googlesyndication\.com\/pagead\/[^"']+)["'][^>]*>\s*<\/script>/i
  );
  const srcLoose = s.match(
    /(https:\/\/pagead2\.googlesyndication\.com\/pagead\/adsbygoogle\.js(?:\?[^"'>\s]*)?)/i
  );

  let externalSrc = srcTag?.[2] || srcLoose?.[1];
  if (!externalSrc && clientId) {
    externalSrc = `https://pagead2.googlesyndication.com/pagead/adsbygoogle.js?client=${clientId}`;
  }

  const crossOrigin =
    /crossorigin\s*=\s*["']anonymous["']/i.test(s) ||
    Boolean(srcTag?.[1] && /crossorigin/i.test(srcTag[1])) ||
    Boolean(externalSrc);

  const inlineParts: string[] = [];
  const inlineScriptRe = /<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = inlineScriptRe.exec(s)) !== null) {
    const body = m[1]?.trim();
    if (body) inlineParts.push(body);
  }

  let inlineJs = inlineParts.join("\n").trim();
  if (!inlineJs && !externalSrc) {
    inlineJs = stripHtmlNoise(normalizeInlineScript(s) ?? s);
  } else if (inlineJs) {
    inlineJs = stripHtmlNoise(inlineJs);
  }

  if (!externalSrc && !inlineJs) return undefined;

  return {
    clientId,
    externalSrc,
    crossOrigin: Boolean(crossOrigin && externalSrc),
    inlineJs: inlineJs || undefined,
  };
}
