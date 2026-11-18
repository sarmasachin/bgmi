import type { Gta6Section } from "@/src/lib/gta6PageTypes";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Plain intro and sections become one article the rich text editor can open. */
export function gta6ApkHtmlFromParts(intro: string[], sections: Gta6Section[]) {
  const parts: string[] = [];
  for (const paragraph of intro) {
    const value = paragraph.trim();
    if (value) parts.push(`<p>${escapeHtml(value)}</p>`);
  }
  for (const section of sections) {
    const heading = section.h2.trim();
    if (heading) parts.push(`<h2>${escapeHtml(heading)}</h2>`);
    for (const paragraph of section.paragraphs) {
      const value = paragraph.trim();
      if (value) parts.push(`<p>${escapeHtml(value)}</p>`);
    }
  }
  return parts.join("");
}
