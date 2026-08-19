export type SitemapUrlEntry = {
  loc: string;
  lastmod?: string;
  images?: string[];
};

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0, must-revalidate",
    },
  });
}

export function newestLastmod(entries: SitemapUrlEntry[]): string | undefined {
  let best: string | undefined;
  for (const entry of entries) {
    if (!entry.lastmod) continue;
    if (!best || entry.lastmod > best) best = entry.lastmod;
  }
  return best;
}

export function sitemapEntriesToXml(entries: SitemapUrlEntry[]): string {
  const hasImages = entries.some((entry) => entry.images && entry.images.length > 0);
  const ns = hasImages
    ? ' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
    : ' xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

  const urls = entries
    .map((entry) => {
      const loc = escapeXml(entry.loc);
      const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : "";
      const images = (entry.images ?? [])
        .map(
          (src) =>
            `\n    <image:image>\n      <image:loc>${escapeXml(src)}</image:loc>\n    </image:image>`,
        )
        .join("");
      return `  <url>\n    <loc>${loc}</loc>${lastmod}${images}\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset${ns}>\n${urls}\n</urlset>\n`;
}

export function sitemapIndexToXml(
  children: Array<{ loc: string; lastmod?: string }>,
): string {
  const rows = children
    .map((child) => {
      const lastmod = child.lastmod ? `\n    <lastmod>${escapeXml(child.lastmod)}</lastmod>` : "";
      return `  <sitemap>\n    <loc>${escapeXml(child.loc)}</loc>${lastmod}\n  </sitemap>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</sitemapindex>\n`;
}

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
