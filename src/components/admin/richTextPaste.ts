/** Paste colors + foreign fonts (Word/Georgia) that override the site typeface. */
const PASTE_STYLE_DROP =
  /^(?:color|background(?:-color|-image|-position|-size|-repeat|-attachment|-clip|-origin)?|-webkit-text-fill-color|-webkit-text-stroke(?:-color)?|caret-color|text-decoration-color|font(?:-family|-size|-stretch|-variant|-kerning|-feature-settings)?)$/i;

function unwrapFontTags(doc: Document) {
  doc.querySelectorAll("font").forEach((element) => {
    const parent = element.parentNode;
    if (!parent) return;
    while (element.firstChild) parent.insertBefore(element.firstChild, element);
    parent.removeChild(element);
  });
}

function stripPastedAppearanceStyles(raw: string) {
  if (typeof window === "undefined") return raw;

  const doc = new DOMParser().parseFromString(raw, "text/html");
  unwrapFontTags(doc);
  doc.querySelectorAll("*").forEach((element) => {
    if (element.hasAttribute("color")) element.removeAttribute("color");
    if (element.hasAttribute("bgcolor")) element.removeAttribute("bgcolor");
    if (element.hasAttribute("face")) element.removeAttribute("face");
    if (element.hasAttribute("size")) element.removeAttribute("size");

    const style = element.getAttribute("style");
    if (!style) return;

    const kept = style
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .filter((part) => {
        const prop = part.split(":")[0]?.trim() ?? "";
        if (!prop) return false;
        if (/^font-weight$/i.test(prop) || /^font-style$/i.test(prop)) return true;
        if (/font/i.test(prop)) return false;
        return !PASTE_STYLE_DROP.test(prop);
      });

    if (kept.length === 0) element.removeAttribute("style");
    else element.setAttribute("style", kept.join("; "));
  });

  return doc.body.innerHTML;
}

export function sanitizeHtml(raw: string) {
  if (typeof window === "undefined") return raw;

  // Always strip paste/editor color wrappers so white <font> never reaches publish.
  const cleaned = stripPastedAppearanceStyles(raw);
  const doc = new DOMParser().parseFromString(cleaned, "text/html");
  const blockedTags = ["script", "style", "object", "embed", "form", "meta", "link"];

  for (const tag of blockedTags) {
    doc.querySelectorAll(tag).forEach((node) => node.remove());
  }

  doc.querySelectorAll("*").forEach((element) => {
    for (const attr of Array.from(element.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();

      if (name.startsWith("on")) {
        element.removeAttribute(attr.name);
        continue;
      }

      if ((name === "href" || name === "src") && value.startsWith("javascript:")) {
        element.removeAttribute(attr.name);
        continue;
      }

      if (name === "style" && /expression|javascript:/i.test(attr.value)) {
        element.removeAttribute(attr.name);
      }
    }

    if (element.tagName === "IFRAME") {
      const src = element.getAttribute("src") ?? "";
      const allowed =
        src.includes("youtube.com/embed/") ||
        src.includes("youtube-nocookie.com/embed/") ||
        src.includes("player.vimeo.com/video/");

      if (!allowed) {
        element.remove();
      }
    }
  });

  return doc.body.innerHTML;
}

function escapeCell(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Tab-separated rows (Excel/Sheets plain text) become a real table. */
export function plainTextToTable(plain: string) {
  const text = plain.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n+$/, "");
  if (!text.includes("\t")) return "";

  const rows = text.split("\n").map((line) => line.split("\t"));
  const nonEmpty = rows.filter((row) => row.some((cell) => cell.trim() !== ""));
  if (nonEmpty.length === 0) return "";

  const tabRows = nonEmpty.filter((row) => row.length >= 2);
  if (tabRows.length === 0 || tabRows.length * 2 < nonEmpty.length) return "";

  const cols = Math.max(...nonEmpty.map((row) => row.length));
  if (cols < 2) return "";

  const body = nonEmpty
    .map((row) => {
      const cells = Array.from({ length: cols }, (_, index) => {
        const value = escapeCell(row[index] ?? "").trim();
        return `<td>${value || "<br>"}</td>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `<table><tbody>${body}</tbody></table>`;
}

function htmlHasVisibleText(html: string) {
  if (typeof window === "undefined") return false;
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").replace(/\u00a0/g, " ").trim().length > 0;
}

export type EditorPasteAction =
  | { type: "html"; html: string }
  | { type: "files" }
  | { type: "browser" };

/**
 * Excel/Word put a picture file on the clipboard next to the table HTML.
 * Prefer the table (or any real text) over that picture. Image-only paste still uploads.
 */
export function resolveEditorPaste(data: DataTransfer): EditorPasteAction {
  const htmlRaw = data.getData("text/html")?.trim() ?? "";
  const plain = data.getData("text/plain") ?? "";
  const cleaned = htmlRaw ? sanitizeHtml(htmlRaw).trim() : "";
  const fileCount = data.files?.length ?? 0;
  const hasTable = /<table\b/i.test(cleaned);
  const hasText = cleaned ? htmlHasVisibleText(cleaned) : false;

  if (cleaned && (hasTable || hasText)) {
    return { type: "html", html: cleaned };
  }

  const fromPlain = plainTextToTable(plain);
  if (fromPlain) return { type: "html", html: fromPlain };

  if (fileCount > 0) return { type: "files" };
  if (cleaned) return { type: "html", html: cleaned };
  return { type: "browser" };
}
