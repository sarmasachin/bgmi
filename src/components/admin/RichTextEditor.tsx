"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAdminToast } from "@/src/components/admin/AdminToast";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** localStorage key for draft. Defaults to the shared news editor key. */
  storageKey?: string;
};

type UploadedImage = {
  id: string;
  name: string;
  url: string;
};

const DEFAULT_STORAGE_KEY = "bgmi_admin_news_editor_draft_v1";
const TABLE_PICKER_ROWS = 8;
const TABLE_PICKER_COLS = 10;

function sanitizeHtml(raw: string) {
  if (typeof window === "undefined") return raw;

  const doc = new DOMParser().parseFromString(raw, "text/html");
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

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toYouTubeEmbed(url: URL) {
  if (url.hostname.includes("youtu.be")) {
    const id = url.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : "";
  }

  if (url.hostname.includes("youtube.com")) {
    const id = url.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : "";
  }

  return "";
}

function toVimeoEmbed(url: URL) {
  if (!url.hostname.includes("vimeo.com")) return "";
  const match = url.pathname.match(/\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : "";
}

function toEmbedUrl(raw: string) {
  try {
    const url = new URL(raw);
    return toYouTubeEmbed(url) || toVimeoEmbed(url) || "";
  } catch {
    return "";
  }
}

export function RichTextEditor({
  value,
  onChange,
  storageKey = DEFAULT_STORAGE_KEY,
}: Props) {
  const toast = useAdminToast();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const findInputRef = useRef<HTMLInputElement | null>(null);
  const tablePickerAnchorRef = useRef<HTMLDivElement | null>(null);
  const tablePickerHideTimerRef = useRef<number | null>(null);
  const linkRangeRef = useRef<Range | null>(null);
  const linkInputRef = useRef<HTMLInputElement | null>(null);
  const resizeStateRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const tablePickerSelectionRef = useRef({
    active: false,
    rows: 0,
    cols: 0,
  });
  const activeTableRef = useRef<HTMLTableElement | null>(null);
  const dragStateRef = useRef<{
    kind: "row" | "col";
    table: HTMLTableElement;
    startX: number;
    startY: number;
    startRows: number;
    startCols: number;
  } | null>(null);
  const tableResizeRef = useRef<{
    kind: "width" | "col" | "row";
    table: HTMLTableElement;
    startX: number;
    startY: number;
    startWidth: number;
    startColWidth: number;
    startColWidths: number[];
    startRowHeight: number;
    colIndex: number;
    rowIndex: number;
  } | null>(null);
  const tableClipboardRef = useRef<string>("");
  const tableSortAscRef = useRef(true);
  const typingRef = useRef(false);
  const typingTimerRef = useRef<number | null>(null);
  const syncFromEditorRef = useRef(false);
  const lastEmittedHtmlRef = useRef<string>("");
  const tableUiHideTimerRef = useRef<number | null>(null);
  const mutationLockRef = useRef(false);
  const mutationUnlockTimerRef = useRef<number | null>(null);

  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceValue, setSourceValue] = useState(value);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasRestorableDraft, setHasRestorableDraft] = useState(false);

  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState("3");
  const [textColor, setTextColor] = useState("#ffffff");
  const [highlightColor, setHighlightColor] = useState("#1d4ed8");
  const [cellBgColor, setCellBgColor] = useState("#1e293b");
  const [cellBorderColor, setCellBorderColor] = useState("#38bdf8");
  const [cellPaddingPx, setCellPaddingPx] = useState(8);
  const [cellSpacingPx, setCellSpacingPx] = useState(0);

  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const [tablePickerRows, setTablePickerRows] = useState(0);
  const [tablePickerCols, setTablePickerCols] = useState(0);
  const [tablePickerPos, setTablePickerPos] = useState({ top: 0, left: 0 });
  const [linkPopover, setLinkPopover] = useState({
    open: false,
    top: 0,
    left: 0,
    url: "",
  });
  const [editorHeight, setEditorHeight] = useState(360);
  const [headingValue, setHeadingValue] = useState("");
  const [tableHandle, setTableHandle] = useState({
    visible: false,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [cellPlus, setCellPlus] = useState({
    visible: false,
    menuOpen: false,
    top: 0,
    left: 0,
  });
  const activeCellRef = useRef<HTMLTableCellElement | null>(null);

  useEffect(() => {
    setSourceValue((prev) => (prev === value ? prev : value));
    if (isSourceMode || !editorRef.current) return;

    // Own echo from syncEditorValue / typing — never rewrite DOM (main blink cause).
    if (value === lastEmittedHtmlRef.current) {
      syncFromEditorRef.current = false;
      return;
    }

    if (
      typingRef.current ||
      syncFromEditorRef.current ||
      mutationLockRef.current ||
      document.activeElement === editorRef.current
    ) {
      // Focused / mid-mutation editor owns the live DOM — never clobber it from props.
      syncFromEditorRef.current = false;
      lastEmittedHtmlRef.current = value;
      return;
    }

    // External update only (load article, restore draft, reset form) while unfocused.
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
    lastEmittedHtmlRef.current = value;
  }, [value, isSourceMode]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
      if (tablePickerHideTimerRef.current) {
        window.clearTimeout(tablePickerHideTimerRef.current);
      }
      if (tableUiHideTimerRef.current) {
        window.clearTimeout(tableUiHideTimerRef.current);
      }
      if (mutationUnlockTimerRef.current) {
        window.clearTimeout(mutationUnlockTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (value.trim()) {
        window.localStorage.setItem(storageKey, value);
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [value, storageKey]);

  useEffect(() => {
    // Never auto-inject draft into a blank/new editor — only offer restore.
    const draft = window.localStorage.getItem(storageKey);
    if (!draft) {
      setHasRestorableDraft((prev) => (prev ? false : prev));
      return;
    }

    const current = value.trim();
    const isDefault = current === "" || current === "<p>Start writing...</p>" || current === "<p><br></p>";
    const next = isDefault || draft !== current;
    setHasRestorableDraft((prev) => (prev === next ? prev : next));
  }, [storageKey, value]);

  const plainText = useMemo(() => {
    if (typeof window === "undefined") return "";
    const temp = document.createElement("div");
    temp.innerHTML = value;
    return temp.textContent ?? temp.innerText ?? "";
  }, [value]);

  function focusEditor() {
    editorRef.current?.focus();
  }

  function commitHtml(nextHtml: string) {
    const safe = sanitizeHtml(nextHtml);
    syncFromEditorRef.current = true;
    lastEmittedHtmlRef.current = safe;
    onChange(safe);
    // Do not rewrite editor.innerHTML on blur — sanitize normalization
    // would rebuild the whole DOM and blink the page.
  }

  function syncEditorValue() {
    const html = editorRef.current?.innerHTML ?? "";
    if (html === lastEmittedHtmlRef.current) return;
    syncFromEditorRef.current = true;
    lastEmittedHtmlRef.current = html;
    onChange(html);
  }

  /** Lock prop→DOM writes while we mutate the live contentEditable tree. */
  function withEditorMutation(run: () => void) {
    mutationLockRef.current = true;
    typingRef.current = true;
    syncFromEditorRef.current = true;
    if (mutationUnlockTimerRef.current) {
      window.clearTimeout(mutationUnlockTimerRef.current);
    }
    try {
      run();
    } finally {
      syncEditorValue();
      mutationUnlockTimerRef.current = window.setTimeout(() => {
        mutationLockRef.current = false;
        typingRef.current = false;
        mutationUnlockTimerRef.current = null;
      }, 200);
    }
  }

  function onEditorInput() {
    typingRef.current = true;
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
    }
    syncEditorValue();
    typingTimerRef.current = window.setTimeout(() => {
      typingRef.current = false;
    }, 150);
  }

  function onEditorBlur() {
    typingRef.current = false;
    commitHtml(editorRef.current?.innerHTML ?? "");
  }

  function runCommand(command: string, commandValue?: string) {
    focusEditor();
    // Prefer semantic tags (b/strong/a) so editor styles can make formatting obvious.
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(command, false, commandValue);
    syncEditorValue();
  }

  function applyHeading(level: number) {
    focusEditor();

    if (level === 0) {
      document.execCommand("formatBlock", false, "P");
      syncEditorValue();
      return;
    }

    if (level >= 1 && level <= 6) {
      document.execCommand("formatBlock", false, `H${level}`);
      syncEditorValue();
      return;
    }

    document.execCommand("formatBlock", false, "P");
    const selection = window.getSelection();
    let anchor = selection?.anchorNode ?? null;

    if (anchor?.nodeType === Node.TEXT_NODE) {
      anchor = anchor.parentElement;
    }

    const block = (anchor as HTMLElement | null)?.closest("p,div");
    if (block) {
      block.classList.remove("rich-h7", "rich-h8");
      block.classList.add(level === 7 ? "rich-h7" : "rich-h8");
    }

    syncEditorValue();
  }

  function toggleLeftLineAccent() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    let anchor: Node | null = selection.anchorNode;
    if (!anchor) return;
    if (anchor.nodeType === Node.TEXT_NODE) {
      anchor = anchor.parentElement;
    }

    const block = (anchor as HTMLElement | null)?.closest(
      "p,h1,h2,h3,h4,h5,h6,blockquote,li,div",
    ) as HTMLElement | null;

    if (!block || !editor.contains(block)) return;
    block.classList.toggle("left-line-accent");
    syncEditorValue();
  }

  function syncHeadingFromSelection() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const anchor = selection?.anchorNode ?? null;

    if (!editor || !anchor || !editor.contains(anchor)) {
      setHeadingValue((prev) => (prev === "" ? prev : ""));
      return;
    }

    let element = anchor.nodeType === Node.TEXT_NODE ? anchor.parentElement : (anchor as HTMLElement | null);
    let next = "0";

    while (element && element !== editor) {
      const tag = element.tagName.toLowerCase();
      if (tag === "h1") {
        next = "1";
        break;
      }
      if (tag === "h2") {
        next = "2";
        break;
      }
      if (tag === "h3") {
        next = "3";
        break;
      }
      if (tag === "h4") {
        next = "4";
        break;
      }
      if (tag === "h5") {
        next = "5";
        break;
      }
      if (tag === "h6") {
        next = "6";
        break;
      }
      if (element.classList.contains("rich-h7")) {
        next = "7";
        break;
      }
      if (element.classList.contains("rich-h8")) {
        next = "8";
        break;
      }
      element = element.parentElement;
    }

    setHeadingValue((prev) => (prev === next ? prev : next));
  }

  function closeLinkPopover() {
    linkRangeRef.current = null;
    setLinkPopover({ open: false, top: 0, left: 0, url: "" });
  }

  function positionLinkPopover(rect: DOMRect, fallbackRect?: DOMRect) {
    const popoverWidth = 320;
    const popoverHeight = 42;
    const gap = 8;
    const base = rect.width || rect.height ? rect : fallbackRect;
    const top =
      base && base.top > 0
        ? Math.max(8, base.top - popoverHeight - gap)
        : Math.max(8, (fallbackRect?.top || 80) - popoverHeight - gap);
    const left = Math.min(
      window.innerWidth - popoverWidth - 8,
      Math.max(
        8,
        (base?.left || fallbackRect?.left || 8) + (base?.width || 0) / 2 - popoverWidth / 2,
      ),
    );
    return { top, left };
  }

  function openLinkPopoverAt(range: Range, url = "") {
    const editor = editorRef.current;
    if (!editor) return;
    linkRangeRef.current = range;
    const rect = range.getBoundingClientRect();
    const { top, left } = positionLinkPopover(rect, editor.getBoundingClientRect());
    setLinkPopover({ open: true, top, left, url });
    window.setTimeout(() => {
      linkInputRef.current?.focus();
      linkInputRef.current?.select();
    }, 0);
  }

  function insertLink() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0).cloneRange();
    const editor = editorRef.current;
    if (!editor || !editor.contains(range.commonAncestorContainer)) return;

    let existingUrl = "";
    let anchor: Node | null = range.commonAncestorContainer;
    if (anchor.nodeType === Node.TEXT_NODE) anchor = anchor.parentElement;
    const existingLink = (anchor as HTMLElement | null)?.closest("a");
    if (existingLink && editor.contains(existingLink)) {
      existingUrl = existingLink.getAttribute("href") ?? "";
      const linkRange = document.createRange();
      linkRange.selectNodeContents(existingLink);
      openLinkPopoverAt(linkRange, existingUrl);
      return;
    }

    openLinkPopoverAt(range, "");
  }

  function applyLink() {
    let url = linkPopover.url.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith("/") && !url.startsWith("#") && !url.startsWith("mailto:")) {
      url = `https://${url}`;
    }

    const range = linkRangeRef.current;
    const selection = window.getSelection();
    const editor = editorRef.current;
    if (range && selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    // If caret is inside an existing link, update href instead of nesting.
    let anchorNode: Node | null = selection?.anchorNode ?? null;
    if (anchorNode?.nodeType === Node.TEXT_NODE) anchorNode = anchorNode.parentElement;
    const existingLink = (anchorNode as HTMLElement | null)?.closest("a");
    if (existingLink && editor?.contains(existingLink)) {
      existingLink.setAttribute("href", url);
      existingLink.setAttribute("target", "_blank");
      existingLink.setAttribute("rel", "noopener noreferrer");
      syncEditorValue();
      closeLinkPopover();
      return;
    }

    runCommand("createLink", url);

    // Ensure newly created links open in a new tab and stay visually clear.
    window.setTimeout(() => {
      const root = editorRef.current;
      if (!root) return;
      root.querySelectorAll("a[href]").forEach((node) => {
        const href = node.getAttribute("href") ?? "";
        if (href === url || href === linkPopover.url.trim()) {
          node.setAttribute("target", "_blank");
          node.setAttribute("rel", "noopener noreferrer");
        }
      });
      syncEditorValue();
    }, 0);

    closeLinkPopover();
  }

  function removeLinkFromPopover() {
    const range = linkRangeRef.current;
    const selection = window.getSelection();
    const editor = editorRef.current;
    if (range && selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }

    let anchorNode: Node | null = selection?.anchorNode ?? null;
    if (anchorNode?.nodeType === Node.TEXT_NODE) anchorNode = anchorNode.parentElement;
    const existingLink = (anchorNode as HTMLElement | null)?.closest("a");
    if (existingLink && editor?.contains(existingLink)) {
      runCommand("unlink");
    }
    closeLinkPopover();
  }

  function handleEditorClick(event: React.MouseEvent<HTMLDivElement>) {
    setActiveTableFromSelection();
    syncHeadingFromSelection();

    const target = event.target as HTMLElement | null;
    const link = target?.closest?.("a");
    const editor = editorRef.current;
    if (!link || !editor || !editor.contains(link)) return;

    // Ctrl/Cmd + click opens the real URL; normal click shows/edits the link.
    if (event.ctrlKey || event.metaKey) {
      const href = link.getAttribute("href");
      if (href) window.open(href, "_blank", "noopener,noreferrer");
      return;
    }

    event.preventDefault();
    const range = document.createRange();
    range.selectNodeContents(link);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    openLinkPopoverAt(range, link.getAttribute("href") ?? "");
  }

  function insertImageByUrl() {
    const url = window.prompt("Enter image URL");
    if (!url) return;
    const altText = (window.prompt("Enter image alt text") ?? "").trim() || "article-image";
    const safeUrl = url.replace(/"/g, "&quot;");
    const safeAlt = altText.replace(/"/g, "&quot;");
    focusEditor();
    document.execCommand(
      "insertHTML",
      false,
      `<img src="${safeUrl}" alt="${safeAlt}" width="1200" height="675" style="display:block;width:100%;max-width:520px;height:auto;aspect-ratio:1200/675;object-fit:cover;margin:12px auto;border-radius:8px;" /><p></p>`,
    );
    syncEditorValue();
  }

  function insertCodeBlock() {
    focusEditor();
    document.execCommand("insertHTML", false, "<pre><code>// code</code></pre><p></p>");
    syncEditorValue();
  }

  function insertCommentBlock() {
    const text = window.prompt("Enter comment text");
    if (!text) return;
    focusEditor();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const commentP = document.createElement("p");
    const em = document.createElement("em");
    em.textContent = `Comment: ${text}`;
    commentP.appendChild(em);

    const nextP = document.createElement("p");
    const br = document.createElement("br");
    nextP.appendChild(br);

    range.insertNode(nextP);
    range.insertNode(commentP);

    const caret = document.createRange();
    caret.setStart(nextP, 0);
    caret.collapse(true);
    selection.removeAllRanges();
    selection.addRange(caret);

    syncEditorValue();
  }

  function clearFormatting() {
    runCommand("removeFormat");
    runCommand("unlink");
  }

  function onSourceModeToggle(nextMode: boolean) {
    if (!nextMode) {
      commitHtml(sourceValue);
    }
    setIsSourceMode(nextMode);
  }

  function getCurrentCell() {
    const selection = window.getSelection();
    let anchor = selection?.anchorNode ?? null;

    if (anchor?.nodeType === Node.TEXT_NODE) {
      anchor = anchor.parentElement;
    }

    return (anchor as HTMLElement | null)?.closest("td,th") as HTMLTableCellElement | null;
  }

  function isCellPlusEligible(cell: HTMLTableCellElement) {
    const text = (cell.textContent ?? "").replace(/\u00a0/g, " ").trim();
    return !text;
  }

  function hideCellPlusUi() {
    setCellPlus((prev) => (prev.visible || prev.menuOpen ? { visible: false, menuOpen: false, top: 0, left: 0 } : prev));
  }

  function hideCellPlus() {
    activeCellRef.current = null;
    hideCellPlusUi();
  }

  function updateCellPlusPosition() {
    const editor = editorRef.current;
    const cell = activeCellRef.current;
    if (!editor || !cell || !cell.isConnected || !isCellPlusEligible(cell)) {
      // Don't clear activeCellRef here — only hide the + overlay.
      hideCellPlusUi();
      return;
    }

    const cellRect = cell.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();
    // Sit on the selected cell's top border, horizontally centered (edit + control).
    const top = Math.round(cellRect.top - editorRect.top + editor.scrollTop - 9);
    const left = Math.round(cellRect.left - editorRect.left + editor.scrollLeft + cellRect.width / 2 - 9);
    setCellPlus((prev) => {
      if (prev.visible && !prev.menuOpen && prev.top === top && prev.left === left) return prev;
      return {
        ...prev,
        visible: true,
        top,
        left,
      };
    });
  }

  function updateTableHandlePosition() {
    const editor = editorRef.current;
    const table =
      tableResizeRef.current?.table ?? dragStateRef.current?.table ?? activeTableRef.current;
    if (!editor || !table || !table.isConnected) {
      if (!tableResizeRef.current && !dragStateRef.current) {
        setTableHandle((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        hideCellPlus();
      }
      return;
    }

    activeTableRef.current = table;
    const tableRect = table.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();
    const next = {
      visible: true,
      top: Math.round(tableRect.top - editorRect.top + editor.scrollTop),
      left: Math.round(tableRect.left - editorRect.left + editor.scrollLeft),
      width: Math.round(tableRect.width),
      height: Math.round(tableRect.height),
    };

    setTableHandle((prev) => {
      if (
        prev.visible === next.visible &&
        prev.top === next.top &&
        prev.left === next.left &&
        prev.width === next.width &&
        prev.height === next.height
      ) {
        return prev;
      }
      return next;
    });
    updateCellPlusPosition();
  }

  function getTargetTable() {
    const cell = getCurrentCell();
    const tableFromCell = cell?.closest("table") as HTMLTableElement | null;
    const fallbackTable =
      activeTableRef.current ??
      (editorRef.current?.querySelector("table:last-of-type") as HTMLTableElement | null);
    const table = tableFromCell ?? fallbackTable;
    if (table) {
      activeTableRef.current = table;
    }
    return { cell, table };
  }

  function getActiveTableFromSelection() {
    const selection = window.getSelection();
    let anchor: Node | null = selection?.anchorNode ?? null;
    if (!anchor) return null;
    if (anchor.nodeType === Node.TEXT_NODE) {
      anchor = anchor.parentElement;
    }
    return (anchor as HTMLElement | null)?.closest("table") as HTMLTableElement | null;
  }

  function clearTableToolsUi() {
    activeTableRef.current = null;
    hideCellPlus();
    setTableHandle((prev) => (prev.visible ? { ...prev, visible: false } : prev));
  }

  function setActiveTableFromSelection() {
    // Keep active table locked while dragging/resizing handles (focus leaves the editor).
    if (tableResizeRef.current || dragStateRef.current || mutationLockRef.current) return;

    const next = getActiveTableFromSelection();
    const cell = getCurrentCell();
    if (next) {
      // Cancel any pending hide — click often fires a brief "outside" selection first.
      if (tableUiHideTimerRef.current) {
        window.clearTimeout(tableUiHideTimerRef.current);
        tableUiHideTimerRef.current = null;
      }
      activeTableRef.current = next;
      activeCellRef.current = cell && next.contains(cell) ? cell : null;
      updateTableHandlePosition();
      return;
    }

    // Selection left the table — keep tools only if user is clicking table toolbar/handles.
    const activeEl = document.activeElement as HTMLElement | null;
    if (activeEl?.closest?.(".rich-editor-table-toolbar, .table-drag-handle, .table-cell-plus")) {
      return;
    }

    // Debounce hide: during mousedown/click, selection briefly becomes null or leaves the
    // table, which was unmounting Table tools then remounting them (= blink).
    if (tableUiHideTimerRef.current) {
      window.clearTimeout(tableUiHideTimerRef.current);
    }
    tableUiHideTimerRef.current = window.setTimeout(() => {
      tableUiHideTimerRef.current = null;
      if (tableResizeRef.current || dragStateRef.current || mutationLockRef.current) return;
      if (getActiveTableFromSelection()) {
        setActiveTableFromSelection();
        return;
      }
      const still = document.activeElement as HTMLElement | null;
      if (still?.closest?.(".rich-editor-table-toolbar, .table-drag-handle, .table-cell-plus")) {
        return;
      }
      clearTableToolsUi();
    }, 150);
  }

  function setTableColumnCount(table: HTMLTableElement, targetCols: number) {
    const safeTarget = Math.max(1, Math.min(20, targetCols));
    const currentCols = table.rows[0]?.cells.length ?? 0;
    if (!currentCols) return;

    if (safeTarget > currentCols) {
      const toAdd = safeTarget - currentCols;
      Array.from(table.rows).forEach((row) => {
        for (let i = 0; i < toAdd; i += 1) {
          row.insertCell().innerHTML = "<br>";
        }
      });
      rebalanceTableColumns(table);
      return;
    }

    if (safeTarget < currentCols) {
      const toRemove = currentCols - safeTarget;
      Array.from(table.rows).forEach((row) => {
        for (let i = 0; i < toRemove; i += 1) {
          if (row.cells.length > 1) {
            row.deleteCell(row.cells.length - 1);
          }
        }
      });
      rebalanceTableColumns(table);
    }
  }

  function setTableRowCount(table: HTMLTableElement, targetRows: number) {
    const safeTarget = Math.max(1, Math.min(30, targetRows));
    const currentRows = table.rows.length;
    if (!currentRows) return;
    const colCount = table.rows[0]?.cells.length ?? 1;

    if (safeTarget > currentRows) {
      const toAdd = safeTarget - currentRows;
      for (let i = 0; i < toAdd; i += 1) {
        const row = table.insertRow();
        for (let c = 0; c < colCount; c += 1) {
          row.insertCell().innerHTML = "<br>";
        }
      }
      return;
    }

    if (safeTarget < currentRows) {
      const toRemove = currentRows - safeTarget;
      for (let i = 0; i < toRemove; i += 1) {
        if (table.rows.length > 1) {
          table.deleteRow(table.rows.length - 1);
        }
      }
    }
  }

  function ensureColGroup(table: HTMLTableElement) {
    const colCount = table.rows[0]?.cells.length ?? 0;
    if (!colCount) return null;

    let group = table.querySelector("colgroup");
    if (!group) {
      group = document.createElement("colgroup");
      table.insertBefore(group, table.firstChild);
    }

    while (group.children.length < colCount) {
      group.appendChild(document.createElement("col"));
    }
    while (group.children.length > colCount) {
      group.lastElementChild?.remove();
    }

    const knownWidths = Array.from(group.children)
      .map((colEl) => parseFloat((colEl as HTMLElement).style.width))
      .filter((w) => Number.isFinite(w) && w >= 48);
    const avgKnown = knownWidths.length
      ? Math.round(knownWidths.reduce((a, b) => a + b, 0) / knownWidths.length)
      : 120;

    Array.from(group.children).forEach((colEl, index) => {
      const col = colEl as HTMLElement;
      const raw = parseFloat(col.style.width);
      if (Number.isFinite(raw) && raw >= 48) return;
      const cell = table.rows[0]?.cells[index];
      const measured = Math.round(cell?.getBoundingClientRect().width || 0);
      const width = measured >= 48 ? measured : Math.max(100, avgKnown);
      col.style.width = `${width}px`;
    });

    table.style.tableLayout = "fixed";
    // Convert % / empty width to px so W− / drag can shrink reliably.
    const widthCss = table.style.width.trim();
    if (!widthCss || widthCss.endsWith("%")) {
      table.style.width = `${Math.round(table.getBoundingClientRect().width)}px`;
    }
    table.style.maxWidth = "100%";
    table.style.minWidth = "0";
    return group;
  }

  /** After add/remove column: grow until page max, then fit inside — never overflow. */
  function rebalanceTableColumns(table: HTMLTableElement) {
    const colCount = table.rows[0]?.cells.length ?? 0;
    if (!colCount) return;

    const pageWidth = getEditorPageWidth();
    const group = ensureColGroup(table);
    if (!group) return;

    const widths = Array.from(group.children).map((colEl) => {
      const w = parseFloat((colEl as HTMLElement).style.width);
      return Number.isFinite(w) && w >= 40 ? w : 0;
    });
    const known = widths.filter((w) => w > 0);
    const avg = known.length ? Math.round(known.reduce((a, b) => a + b, 0) / known.length) : 120;
    const filled = widths.map((w) => (w > 0 ? w : Math.max(80, avg)));
    const naturalTotal = filled.reduce((a, b) => a + b, 0);

    // Cap at editor content width so table never leaves the page.
    const targetWidth = Math.min(pageWidth, Math.max(naturalTotal, 1));

    if (naturalTotal > pageWidth) {
      // Redistribute evenly so column widths SUM exactly to pageWidth.
      const base = Math.floor(pageWidth / colCount);
      let remainder = pageWidth - base * colCount;
      Array.from(group.children).forEach((colEl, index) => {
        const extra = remainder > 0 ? 1 : 0;
        if (remainder > 0) remainder -= 1;
        (colEl as HTMLElement).style.width = `${Math.max(24, base + extra)}px`;
      });
    } else {
      Array.from(group.children).forEach((colEl, index) => {
        (colEl as HTMLElement).style.width = `${filled[index]}px`;
      });
    }

    table.style.tableLayout = "fixed";
    table.style.width = `${targetWidth}px`;
    table.style.maxWidth = "100%";
    table.style.minWidth = "0";
    table.style.boxSizing = "border-box";
  }

  function startTableWidthResize(event: React.MouseEvent<HTMLButtonElement>) {
    const table = activeTableRef.current;
    if (!table) return;
    event.preventDefault();
    event.stopPropagation();
    const group = ensureColGroup(table);
    const startWidth = Math.round(table.getBoundingClientRect().width);
    const startColWidths = group
      ? Array.from(group.children).map((colEl) => {
          const col = colEl as HTMLElement;
          const raw = parseFloat(col.style.width);
          return Number.isFinite(raw) && raw > 0 ? raw : startWidth / Math.max(1, group.children.length);
        })
      : [];

    // Convert % width to px so drag can shrink below full editor width.
    table.style.tableLayout = "fixed";
    table.style.width = `${startWidth}px`;
    table.style.maxWidth = "100%";
    table.style.minWidth = "0";

    tableResizeRef.current = {
      kind: "width",
      table,
      startX: event.clientX,
      startY: event.clientY,
      startWidth,
      startColWidth: 0,
      startColWidths,
      startRowHeight: 0,
      colIndex: -1,
      rowIndex: -1,
    };
  }

  function nudgeTableWidth(direction: "smaller" | "larger") {
    const { table } = getTargetTable();
    if (!table) {
      toast.warning("Select a table cell first.");
      return;
    }

    const group = ensureColGroup(table);
    const editorW = Math.max(240, editorRef.current?.clientWidth || 900);
    const current = Math.max(160, Math.round(table.getBoundingClientRect().width || editorW));
    const next =
      direction === "smaller"
        ? Math.max(160, Math.round(current * 0.8))
        : Math.min(Math.round(editorW * 0.98), Math.round(current * 1.25));

    if (next === current) {
      toast.warning(direction === "smaller" ? "Table already at minimum width." : "Table already at max width.");
      return;
    }

    const ratio = next / current;
    table.style.tableLayout = "fixed";
    table.style.width = `${next}px`;
    table.style.maxWidth = "100%";
    table.style.minWidth = "0";

    if (group) {
      Array.from(group.children).forEach((colEl) => {
        const col = colEl as HTMLElement;
        const raw = parseFloat(col.style.width);
        const base = Number.isFinite(raw) && raw > 0 ? raw : current / Math.max(1, group.children.length);
        col.style.width = `${Math.max(40, Math.round(base * ratio))}px`;
      });
    }

    updateTableHandlePosition();
    syncEditorValue();
  }

  function onEditorMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement | null;
    const cell = target?.closest?.("td,th") as HTMLTableCellElement | null;
    const editor = editorRef.current;
    if (!cell || !editor || !editor.contains(cell)) return;

    const table = cell.closest("table") as HTMLTableElement | null;
    if (!table) return;

    const rect = cell.getBoundingClientRect();
    const nearRight = rect.right - event.clientX <= 7;
    const nearBottom = rect.bottom - event.clientY <= 7;
    if (!nearRight && !nearBottom) return;

    event.preventDefault();
    activeTableRef.current = table;
    ensureColGroup(table);
    updateTableHandlePosition();

    if (nearRight) {
      const group = table.querySelector("colgroup");
      const col = group?.children[cell.cellIndex] as HTMLElement | undefined;
      const startColWidth = Math.round(
        col ? parseFloat(col.style.width) || col.getBoundingClientRect().width : rect.width,
      );
      tableResizeRef.current = {
        kind: "col",
        table,
        startX: event.clientX,
        startY: event.clientY,
        startWidth: Math.round(table.getBoundingClientRect().width),
        startColWidth,
        startColWidths: [],
        startRowHeight: 0,
        colIndex: cell.cellIndex,
        rowIndex: -1,
      };
      return;
    }

    tableResizeRef.current = {
      kind: "row",
      table,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: Math.round(table.getBoundingClientRect().width),
      startColWidth: 0,
      startColWidths: [],
      startRowHeight: Math.round(rect.height),
      colIndex: -1,
      rowIndex: (cell.parentElement as HTMLTableRowElement | null)?.rowIndex ?? 0,
    };
  }

  function onEditorMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (tableResizeRef.current || dragStateRef.current) return;
    const target = event.target as HTMLElement | null;
    const cell = target?.closest?.("td,th") as HTMLTableCellElement | null;
    const editor = editorRef.current;
    if (!cell || !editor || !editor.contains(cell)) {
      if (editor) editor.style.cursor = "";
      return;
    }
    const rect = cell.getBoundingClientRect();
    const nearRight = rect.right - event.clientX <= 7;
    const nearBottom = rect.bottom - event.clientY <= 7;
    editor.style.cursor = nearRight ? "col-resize" : nearBottom ? "row-resize" : "";
  }

  function startTableDrag(kind: "row" | "col", event: React.MouseEvent<HTMLButtonElement>) {
    const table = activeTableRef.current;
    if (!table) return;

    event.preventDefault();
    event.stopPropagation();

    dragStateRef.current = {
      kind,
      table,
      startX: event.clientX,
      startY: event.clientY,
      startRows: table.rows.length,
      startCols: table.rows[0]?.cells.length ?? 1,
    };
  }

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      const resize = resizeStateRef.current;
      if (resize) {
        const delta = event.clientY - resize.startY;
        const nextHeight = Math.min(900, Math.max(220, resize.startHeight + delta));
        setEditorHeight(nextHeight);
      }

      const tableResize = tableResizeRef.current;
      if (tableResize) {
        const activeTable = tableResize.table;
        activeTableRef.current = activeTable;

        if (tableResize.kind === "width") {
          const editorW = Math.max(240, editorRef.current?.clientWidth || 900);
          const delta = event.clientX - tableResize.startX;
          const next = Math.max(120, Math.min(Math.round(editorW * 0.98), tableResize.startWidth + delta));
          const ratio = next / Math.max(1, tableResize.startWidth);

          activeTable.style.tableLayout = "fixed";
          activeTable.style.width = `${next}px`;
          activeTable.style.maxWidth = "100%";
          activeTable.style.minWidth = "0";

          const group = activeTable.querySelector("colgroup");
          if (group && tableResize.startColWidths.length) {
            Array.from(group.children).forEach((colEl, index) => {
              const base = tableResize.startColWidths[index] || next / group.children.length;
              (colEl as HTMLElement).style.width = `${Math.max(28, Math.round(base * ratio))}px`;
            });
          }

          updateTableHandlePosition();
          return;
        }

        if (tableResize.kind === "col") {
          const delta = event.clientX - tableResize.startX;
          const nextCol = Math.max(28, tableResize.startColWidth + delta);
          const group = ensureColGroup(activeTable);
          const col = group?.children[tableResize.colIndex] as HTMLElement | undefined;
          if (col) col.style.width = `${nextCol}px`;
          // Keep whole table width in sync with column drag.
          const colsTotal = group
            ? Array.from(group.children).reduce((sum, colEl, index) => {
                const el = colEl as HTMLElement;
                const w =
                  index === tableResize.colIndex
                    ? nextCol
                    : parseFloat(el.style.width) || el.getBoundingClientRect().width;
                return sum + (Number.isFinite(w) ? w : 0);
              }, 0)
            : nextCol;
          activeTable.style.width = `${Math.max(120, Math.round(colsTotal))}px`;
          activeTable.style.maxWidth = "100%";
          updateTableHandlePosition();
          return;
        }

        if (tableResize.kind === "row") {
          const delta = event.clientY - tableResize.startY;
          const nextHeight = Math.max(28, tableResize.startRowHeight + delta);
          const row = activeTable.rows[tableResize.rowIndex];
          if (row) {
            Array.from(row.cells).forEach((cell) => {
              cell.style.height = `${nextHeight}px`;
            });
          }
          updateTableHandlePosition();
          return;
        }
      }

      const drag = dragStateRef.current;
      if (!drag) return;
      const table = drag.table;
      activeTableRef.current = table;

      if (drag.kind === "col") {
        const step = 80;
        const delta = event.clientX - drag.startX;
        const target = drag.startCols + Math.round(delta / step);
        setTableColumnCount(table, target);
      } else {
        const step = 44;
        const delta = event.clientY - drag.startY;
        const target = drag.startRows + Math.round(delta / step);
        setTableRowCount(table, target);
      }

      // Don't sync on every mousemove — that re-renders parent and blinks the page.
      updateTableHandlePosition();
    };

    const onMouseUp = () => {
      if (resizeStateRef.current) {
        resizeStateRef.current = null;
      }

      if (tableResizeRef.current) {
        tableResizeRef.current = null;
        syncEditorValue();
        updateTableHandlePosition();
      }

      if (dragStateRef.current) {
        dragStateRef.current = null;
        syncEditorValue();
      }

      if (tablePickerSelectionRef.current.active) {
        const rows = tablePickerSelectionRef.current.rows;
        const cols = tablePickerSelectionRef.current.cols;
        tablePickerSelectionRef.current.active = false;
        setTablePickerOpen(false);
        setTablePickerRows(0);
        setTablePickerCols(0);
        if (rows > 0 && cols > 0) {
          insertTableWithSize(rows, cols);
        }
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const onSelectionChange = () => {
      const selection = window.getSelection();
      const anchor = selection?.anchorNode ?? null;
      // Click/focus often emits a transient empty selection — ignoring it stops toolbar blink.
      if (!anchor) return;
      if (!editor.contains(anchor)) return;
      setActiveTableFromSelection();
      syncHeadingFromSelection();
    };
    const onScroll = () => updateTableHandlePosition();

    document.addEventListener("selectionchange", onSelectionChange);
    editor.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);

    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      editor.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function getEditorPageWidth() {
    const editor = editorRef.current;
    if (!editor) return 900;
    const style = window.getComputedStyle(editor);
    const padX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
    // Usable content width only — never let table use full clientWidth (padding overflows).
    return Math.max(200, Math.floor(editor.clientWidth - padX - 2));
  }

  /** Sensible default: ~75% page width, never tiny, never off-screen. */
  function getComfortableTableWidth(colCount = 3) {
    const pageWidth = getEditorPageWidth();
    const cols = Math.max(1, colCount);
    const byColumns = cols * 120;
    const preferred = Math.round(pageWidth * 0.75);
    return Math.min(pageWidth, Math.max(280, preferred, Math.min(byColumns, Math.round(pageWidth * 0.9))));
  }

  function applyComfortableTableSize(table: HTMLTableElement, opts?: { center?: boolean }) {
    const colCount = table.rows[0]?.cells.length ?? 3;
    const width = getComfortableTableWidth(colCount);
    const center = opts?.center !== false;

    table.style.tableLayout = "fixed";
    table.style.width = `${width}px`;
    table.style.maxWidth = "100%";
    table.style.minWidth = "0";
    table.style.marginLeft = center ? "auto" : "0";
    table.style.marginRight = center ? "auto" : "0";
    table.style.float = "none";
    table.removeAttribute("align");

    const group = ensureColGroup(table);
    if (group && group.children.length) {
      const even = Math.max(48, Math.round(width / group.children.length));
      Array.from(group.children).forEach((colEl) => {
        (colEl as HTMLElement).style.width = `${even}px`;
      });
    }
  }

  function insertTableWithSize(rows: number, cols: number) {
    if (!rows || !cols || rows < 1 || cols < 1) return;
    const safeRows = Math.min(rows, 12);
    const safeCols = Math.min(cols, 12);
    const width = getComfortableTableWidth(safeCols);
    const colW = Math.max(48, Math.round(width / safeCols));

    let html =
      `<table style="width:${width}px;max-width:100%;min-width:0;table-layout:fixed;border-collapse:collapse;margin-left:auto;margin-right:auto;">` +
      `<colgroup>${Array.from({ length: safeCols })
        .map(() => `<col style="width:${colW}px" />`)
        .join("")}</colgroup><tbody>`;
    for (let r = 0; r < safeRows; r += 1) {
      html += "<tr>";
      for (let c = 0; c < safeCols; c += 1) {
        html += "<td><br></td>";
      }
      html += "</tr>";
    }
    html += "</tbody></table><p></p>";

    withEditorMutation(() => {
      focusEditor();
      document.execCommand("insertHTML", false, html);
      const lastTable = editorRef.current?.querySelector("table:last-of-type") as HTMLTableElement | null;
      if (lastTable) {
        activeTableRef.current = lastTable;
        const firstCell = lastTable.querySelector("td,th") as HTMLTableCellElement | null;
        activeCellRef.current = firstCell;
        // Size already in inserted HTML — avoid second layout pass (looks like blink).
        updateTableHandlePosition();
      }
    });
  }

  function insertTable() {
    const rows = Number(window.prompt("Rows", "3") ?? "0");
    const cols = Number(window.prompt("Columns", "3") ?? "0");
    insertTableWithSize(rows, cols);
  }

  function openTablePicker() {
    if (tablePickerHideTimerRef.current) {
      window.clearTimeout(tablePickerHideTimerRef.current);
    }
    const rect = tablePickerAnchorRef.current?.getBoundingClientRect();
    if (rect) {
      setTablePickerPos({
        top: rect.bottom + 6,
        left: rect.left,
      });
    }
    setTablePickerOpen(true);
  }

  function closeTablePicker() {
    if (tablePickerSelectionRef.current.active) return;
    tablePickerHideTimerRef.current = window.setTimeout(() => {
      setTablePickerOpen(false);
      setTablePickerRows(0);
      setTablePickerCols(0);
    }, 120);
  }

  function markTablePickerCell(rows: number, cols: number) {
    setTablePickerRows(rows);
    setTablePickerCols(cols);
    tablePickerSelectionRef.current.rows = rows;
    tablePickerSelectionRef.current.cols = cols;
  }

  function startEditorResize(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    resizeStateRef.current = {
      startY: event.clientY,
      startHeight: editorHeight,
    };
  }

  function insertTableRow(position: "above" | "below") {
    withEditorMutation(() => {
      const { cell, table } = getTargetTable();
      if (!table) return;

      const row = cell?.parentElement as HTMLTableRowElement | null;
      const currentIndex = row ? row.rowIndex : table.rows.length - 1;
      const insertAt =
        position === "above"
          ? Math.max(0, currentIndex >= 0 ? currentIndex : 0)
          : currentIndex >= 0
            ? currentIndex + 1
            : table.rows.length;
      const colCount = table.rows[0]?.cells.length ?? row?.cells.length ?? 1;

      const newRow = table.insertRow(insertAt);
      for (let i = 0; i < colCount; i += 1) {
        newRow.insertCell().innerHTML = "<br>";
      }

      updateTableHandlePosition();
    });
  }

  function insertTableColumn(position: "left" | "right") {
    withEditorMutation(() => {
      const { cell, table } = getTargetTable();
      if (!table) return;

      const currentIndex = cell
        ? cell.cellIndex
        : Math.max(0, (table.rows[0]?.cells.length ?? 1) - 1);
      const insertAt = position === "left" ? currentIndex : currentIndex + 1;

      // Insert matching <col> with a real width BEFORE cells, so fixed layout doesn't squash it.
      const group = ensureColGroup(table);
      if (group) {
        const known = Array.from(group.children)
          .map((colEl) => parseFloat((colEl as HTMLElement).style.width))
          .filter((w) => Number.isFinite(w) && w >= 48);
        const avg = known.length ? Math.round(known.reduce((a, b) => a + b, 0) / known.length) : 120;
        const col = document.createElement("col");
        col.style.width = `${Math.max(100, avg)}px`;
        const ref = group.children[insertAt] ?? null;
        group.insertBefore(col, ref);
      }

      Array.from(table.rows).forEach((row) => {
        const newCell = row.insertCell(insertAt);
        newCell.innerHTML = "<br>";
      });

      rebalanceTableColumns(table);
      updateTableHandlePosition();
    });
  }

  function addTableRow() {
    insertTableRow("below");
  }

  function addTableColumn() {
    insertTableColumn("right");
  }

  function deleteTableRow() {
    const { cell, table } = getTargetTable();
    if (!table) return;

    const row = cell?.parentElement as HTMLTableRowElement | null;
    if (row) {
      row.remove();
    } else if (table.rows.length > 1) {
      table.deleteRow(table.rows.length - 1);
    } else {
      return;
    }

    if (table && table.rows.length === 0) {
      table.remove();
    }

    updateTableHandlePosition();
    syncEditorValue();
  }

  function deleteTableColumn() {
    withEditorMutation(() => {
      const { cell, table } = getTargetTable();
      if (!table) return;
      const colIndex = cell
        ? cell.cellIndex
        : Math.max(0, (table.rows[0]?.cells.length ?? 1) - 1);

      Array.from(table.rows).forEach((row) => {
        if (row.cells[colIndex]) {
          row.deleteCell(colIndex);
        }
      });

      const group = table.querySelector("colgroup");
      group?.children[colIndex]?.remove();

      if (table.rows[0] && table.rows[0].cells.length === 0) {
        table.remove();
        clearTableToolsUi();
        return;
      }

      rebalanceTableColumns(table);
      updateTableHandlePosition();
    });
  }

  function deleteWholeTable() {
    const { table } = getTargetTable();
    if (!table) return;

    const parent = table.parentNode;
    const next = table.nextSibling;
    table.remove();

    // Keep caret usable after table removal.
    if (parent) {
      const paragraph = document.createElement("p");
      paragraph.appendChild(document.createElement("br"));
      if (next) {
        parent.insertBefore(paragraph, next);
      } else {
        parent.appendChild(paragraph);
      }
      const selection = window.getSelection();
      if (selection) {
        const caret = document.createRange();
        caret.setStart(paragraph, 0);
        caret.collapse(true);
        selection.removeAllRanges();
        selection.addRange(caret);
      }
    }

    activeTableRef.current = null;
    setTableHandle((prev) => ({ ...prev, visible: false }));
    syncEditorValue();
  }

  function getCellStartColumn(cell: HTMLTableCellElement) {
    const row = cell.parentElement as HTMLTableRowElement | null;
    if (!row) return 0;
    let col = 0;
    for (const current of Array.from(row.cells)) {
      if (current === cell) return col;
      col += current.colSpan || 1;
    }
    return 0;
  }

  function findCellAtColumn(row: HTMLTableRowElement, startCol: number) {
    let col = 0;
    for (const current of Array.from(row.cells)) {
      if (col === startCol) return current;
      col += current.colSpan || 1;
      if (col > startCol) return null;
    }
    return null;
  }

  function replaceCellTag(cell: HTMLTableCellElement, tagName: "th" | "td") {
    if (cell.tagName.toLowerCase() === tagName) return cell;
    const next = document.createElement(tagName);
    next.innerHTML = cell.innerHTML;
    Array.from(cell.attributes).forEach((attr) => {
      next.setAttribute(attr.name, attr.value);
    });
    cell.replaceWith(next);
    return next;
  }

  function toggleTableHeaderRow() {
    const { table } = getTargetTable();
    if (!table || table.rows.length === 0) return;

    const firstRow = table.rows[0];
    const isHeader = Array.from(firstRow.cells).every((cell) => cell.tagName === "TH");

    Array.from(firstRow.cells).forEach((cell) => {
      replaceCellTag(cell, isHeader ? "td" : "th");
    });

    // Keep first row visually marked as header when enabled.
    if (isHeader) {
      firstRow.removeAttribute("data-header-row");
    } else {
      firstRow.setAttribute("data-header-row", "1");
    }

    if (table.classList.contains("table-stack")) {
      syncTableStackLabels(table);
    }

    updateTableHandlePosition();
    syncEditorValue();
  }

  function mergeCellWithRight() {
    const { cell, table } = getTargetTable();
    if (!cell || !table) return;

    const next = cell.nextElementSibling as HTMLTableCellElement | null;
    if (!next) {
      toast.warning("No right cell to merge.");
      return;
    }
    if ((cell.rowSpan || 1) !== (next.rowSpan || 1)) {
      toast.warning("Cells must have the same row span to merge.");
      return;
    }

    const leftText = (cell.textContent ?? "").trim();
    const rightText = (next.textContent ?? "").trim();
    if (rightText) {
      if (leftText) {
        cell.appendChild(document.createTextNode(" "));
      }
      while (next.firstChild) {
        cell.appendChild(next.firstChild);
      }
    }

    cell.colSpan = (cell.colSpan || 1) + (next.colSpan || 1);
    next.remove();
    ensureColGroup(table);
    updateTableHandlePosition();
    syncEditorValue();
  }

  function mergeCellWithBelow() {
    const { cell, table } = getTargetTable();
    if (!cell || !table) return;

    const row = cell.parentElement as HTMLTableRowElement | null;
    if (!row) return;

    const belowRowIndex = row.rowIndex + (cell.rowSpan || 1);
    const belowRow = table.rows[belowRowIndex];
    if (!belowRow) {
      toast.warning("No below cell to merge.");
      return;
    }

    const startCol = getCellStartColumn(cell);
    const belowCell = findCellAtColumn(belowRow, startCol);
    if (!belowCell) {
      toast.warning("No aligned cell below to merge.");
      return;
    }
    if ((belowCell.colSpan || 1) !== (cell.colSpan || 1)) {
      toast.warning("Cells must have the same column span to merge.");
      return;
    }

    const topText = (cell.textContent ?? "").trim();
    const bottomText = (belowCell.textContent ?? "").trim();
    if (bottomText) {
      if (topText) {
        cell.appendChild(document.createElement("br"));
      }
      while (belowCell.firstChild) {
        cell.appendChild(belowCell.firstChild);
      }
    }

    cell.rowSpan = (cell.rowSpan || 1) + (belowCell.rowSpan || 1);
    belowCell.remove();
    updateTableHandlePosition();
    syncEditorValue();
  }

  function splitTableCell() {
    const { cell, table } = getTargetTable();
    if (!cell || !table) return;

    const colSpan = cell.colSpan || 1;
    const rowSpan = cell.rowSpan || 1;
    if (colSpan <= 1 && rowSpan <= 1) {
      toast.warning("Selected cell is not merged.");
      return;
    }

    const row = cell.parentElement as HTMLTableRowElement | null;
    if (!row) return;
    const tagName = cell.tagName === "TH" ? "th" : "td";

    if (colSpan > 1) {
      cell.colSpan = colSpan - 1;
      const newCell = document.createElement(tagName);
      newCell.innerHTML = "<br>";
      if (rowSpan > 1) newCell.rowSpan = rowSpan;
      if (cell.nextSibling) {
        row.insertBefore(newCell, cell.nextSibling);
      } else {
        row.appendChild(newCell);
      }
    } else if (rowSpan > 1) {
      cell.rowSpan = rowSpan - 1;
      const targetRow = table.rows[row.rowIndex + cell.rowSpan];
      if (!targetRow) return;

      const startCol = getCellStartColumn(cell);
      const newCell = document.createElement(tagName);
      newCell.innerHTML = "<br>";

      let insertBefore: HTMLTableCellElement | null = null;
      let col = 0;
      for (const current of Array.from(targetRow.cells)) {
        if (col >= startCol) {
          insertBefore = current;
          break;
        }
        col += current.colSpan || 1;
      }

      if (insertBefore) {
        targetRow.insertBefore(newCell, insertBefore);
      } else {
        targetRow.appendChild(newCell);
      }
    }

    ensureColGroup(table);
    updateTableHandlePosition();
    syncEditorValue();
  }

  function alignCellText(align: "left" | "center" | "right") {
    const { cell } = getTargetTable();
    if (!cell) {
      toast.warning("Select a table cell first.");
      return;
    }
    cell.style.textAlign = align;
    updateTableHandlePosition();
    syncEditorValue();
  }

  function applyCellBackground(color: string) {
    const { cell } = getTargetTable();
    if (!cell) {
      toast.warning("Select a table cell first.");
      return;
    }
    cell.style.backgroundColor = color;
    updateTableHandlePosition();
    syncEditorValue();
  }

  function clearCellBackground() {
    const { cell } = getTargetTable();
    if (!cell) {
      toast.warning("Select a table cell first.");
      return;
    }
    cell.style.backgroundColor = "";
    updateTableHandlePosition();
    syncEditorValue();
  }

  function applyCellBorder(color: string) {
    const { cell } = getTargetTable();
    if (!cell) {
      toast.warning("Select a table cell first.");
      return;
    }
    cell.style.border = `1px solid ${color}`;
    updateTableHandlePosition();
    syncEditorValue();
  }

  function applyCellBorderStyle(style: "solid" | "dashed" | "none") {
    const { cell } = getTargetTable();
    if (!cell) {
      toast.warning("Select a table cell first.");
      return;
    }
    if (style === "none") {
      cell.style.border = "0";
    } else {
      const color = cellBorderColor || "#38bdf8";
      cell.style.border = `1px ${style} ${color}`;
    }
    updateTableHandlePosition();
    syncEditorValue();
  }

  function tableHasSpans(table: HTMLTableElement) {
    return Array.from(table.querySelectorAll("td,th")).some(
      (cell) => ((cell as HTMLTableCellElement).colSpan || 1) > 1 || ((cell as HTMLTableCellElement).rowSpan || 1) > 1,
    );
  }

  async function copyWholeTable() {
    const { table } = getTargetTable();
    if (!table) {
      toast.warning("Select a table first.");
      return;
    }
    const html = table.outerHTML;
    tableClipboardRef.current = html;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(html);
      }
      toast.success("Table copied.");
    } catch {
      toast.success("Table copied in editor.");
    }
  }

  function pasteWholeTable() {
    const html = tableClipboardRef.current.trim();
    if (!html) {
      toast.warning("No copied table found. Use Copy Tbl first.");
      return;
    }

    const { table } = getTargetTable();
    focusEditor();
    if (table?.parentNode) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = html;
      const cloned = wrapper.querySelector("table");
      if (!cloned) {
        toast.error("Copied table is invalid.");
        return;
      }
      if (table.nextSibling) {
        table.parentNode.insertBefore(cloned, table.nextSibling);
      } else {
        table.parentNode.appendChild(cloned);
      }
      const spacer = document.createElement("p");
      spacer.appendChild(document.createElement("br"));
      cloned.after(spacer);
      activeTableRef.current = cloned as HTMLTableElement;
      updateTableHandlePosition();
      syncEditorValue();
      toast.success("Table pasted.");
      return;
    }

    document.execCommand("insertHTML", false, `${html}<p></p>`);
    syncEditorValue();
    toast.success("Table pasted.");
  }

  function sortTableByColumn() {
    const { cell, table } = getTargetTable();
    if (!cell || !table) {
      toast.warning("Select a table cell first.");
      return;
    }
    if (tableHasSpans(table)) {
      toast.warning("Sort needs a simple table without merged cells.");
      return;
    }

    const colIndex = cell.cellIndex;
    const firstRow = table.rows[0];
    const hasHeader = firstRow
      ? Array.from(firstRow.cells).every((item) => item.tagName === "TH") || firstRow.getAttribute("data-header-row") === "1"
      : false;
    const bodyRows = Array.from(table.rows).slice(hasHeader ? 1 : 0);
    if (bodyRows.length < 2) {
      toast.warning("Need at least 2 data rows to sort.");
      return;
    }

    const ascending = tableSortAscRef.current;
    bodyRows.sort((a, b) => {
      const aText = (a.cells[colIndex]?.textContent ?? "").trim();
      const bText = (b.cells[colIndex]?.textContent ?? "").trim();
      const aNum = Number(aText.replace(/,/g, ""));
      const bNum = Number(bText.replace(/,/g, ""));
      const bothNumeric = Number.isFinite(aNum) && Number.isFinite(bNum) && aText !== "" && bText !== "";
      if (bothNumeric) {
        return ascending ? aNum - bNum : bNum - aNum;
      }
      return ascending ? aText.localeCompare(bText) : bText.localeCompare(aText);
    });

    const parent = hasHeader ? firstRow.parentElement : table.tBodies[0] || table;
    if (!parent) return;
    bodyRows.forEach((row) => parent.appendChild(row));

    tableSortAscRef.current = !ascending;
    updateTableHandlePosition();
    syncEditorValue();
    toast.success(ascending ? "Sorted A→Z / low→high." : "Sorted Z→A / high→low.");
  }

  function moveTableRow(direction: "up" | "down") {
    const { cell, table } = getTargetTable();
    if (!cell || !table) {
      toast.warning("Select a table cell first.");
      return;
    }
    if (tableHasSpans(table)) {
      toast.warning("Move needs a simple table without merged cells.");
      return;
    }

    const row = cell.parentElement as HTMLTableRowElement | null;
    if (!row) return;
    const sibling = direction === "up" ? row.previousElementSibling : row.nextElementSibling;
    if (!(sibling instanceof HTMLTableRowElement)) {
      toast.warning(direction === "up" ? "Already at top." : "Already at bottom.");
      return;
    }

    if (direction === "up") {
      row.parentElement?.insertBefore(row, sibling);
    } else {
      row.parentElement?.insertBefore(sibling, row);
    }
    updateTableHandlePosition();
    syncEditorValue();
  }

  function moveTableColumn(direction: "left" | "right") {
    const { cell, table } = getTargetTable();
    if (!cell || !table) {
      toast.warning("Select a table cell first.");
      return;
    }
    if (tableHasSpans(table)) {
      toast.warning("Move needs a simple table without merged cells.");
      return;
    }

    const colIndex = cell.cellIndex;
    const targetIndex = direction === "left" ? colIndex - 1 : colIndex + 1;
    if (targetIndex < 0 || targetIndex >= (table.rows[0]?.cells.length ?? 0)) {
      toast.warning(direction === "left" ? "Already at first column." : "Already at last column.");
      return;
    }

    Array.from(table.rows).forEach((row) => {
      const current = row.cells[colIndex];
      const target = row.cells[targetIndex];
      if (!current || !target) return;
      if (direction === "left") {
        row.insertBefore(current, target);
      } else {
        row.insertBefore(target, current);
      }
    });

    const group = table.querySelector("colgroup");
    if (group && group.children[colIndex] && group.children[targetIndex]) {
      const currentCol = group.children[colIndex];
      const targetCol = group.children[targetIndex];
      if (direction === "left") {
        group.insertBefore(currentCol, targetCol);
      } else {
        group.insertBefore(targetCol, currentCol);
      }
    }

    updateTableHandlePosition();
    syncEditorValue();
  }

  function duplicateTableRow() {
    const { cell, table } = getTargetTable();
    if (!cell || !table) {
      toast.warning("Select a table cell first.");
      return;
    }
    if (tableHasSpans(table)) {
      toast.warning("Duplicate needs a simple table without merged cells.");
      return;
    }

    const row = cell.parentElement as HTMLTableRowElement | null;
    if (!row) return;

    const clone = row.cloneNode(true) as HTMLTableRowElement;
    if (row.nextSibling) {
      row.parentElement?.insertBefore(clone, row.nextSibling);
    } else {
      row.parentElement?.appendChild(clone);
    }

    updateTableHandlePosition();
    syncEditorValue();
    toast.success("Row duplicated.");
  }

  function duplicateTableColumn() {
    const { cell, table } = getTargetTable();
    if (!cell || !table) {
      toast.warning("Select a table cell first.");
      return;
    }
    if (tableHasSpans(table)) {
      toast.warning("Duplicate needs a simple table without merged cells.");
      return;
    }

    const colIndex = cell.cellIndex;
    const group = ensureColGroup(table);

    Array.from(table.rows).forEach((row) => {
      const source = row.cells[colIndex];
      if (!source) return;
      const clone = source.cloneNode(true) as HTMLTableCellElement;
      if (source.nextSibling) {
        row.insertBefore(clone, source.nextSibling);
      } else {
        row.appendChild(clone);
      }
    });

    if (group?.children[colIndex]) {
      const sourceCol = group.children[colIndex] as HTMLElement;
      const cloneCol = sourceCol.cloneNode(true) as HTMLElement;
      if (sourceCol.nextSibling) {
        group.insertBefore(cloneCol, sourceCol.nextSibling);
      } else {
        group.appendChild(cloneCol);
      }
    }

    rebalanceTableColumns(table);
    updateTableHandlePosition();
    syncEditorValue();
    toast.success("Column duplicated.");
  }

  function clearTableCell() {
    const { cell } = getTargetTable();
    if (!cell) {
      toast.warning("Select a table cell first.");
      return;
    }
    cell.innerHTML = "<br>";
    updateTableHandlePosition();
    syncEditorValue();
    toast.success("Cell cleared.");
  }

  function clearTableRow() {
    const { cell, table } = getTargetTable();
    if (!cell || !table) {
      toast.warning("Select a table cell first.");
      return;
    }
    const row = cell.parentElement as HTMLTableRowElement | null;
    if (!row) return;

    Array.from(row.cells).forEach((item) => {
      item.innerHTML = "<br>";
    });

    updateTableHandlePosition();
    syncEditorValue();
    toast.success("Row cleared.");
  }

  function distributeColumnsEvenly() {
    const { table } = getTargetTable();
    if (!table) {
      toast.warning("Select a table first.");
      return;
    }

    const firstRow = table.rows[0];
    if (!firstRow) return;

    const visualCols = Array.from(firstRow.cells).reduce((sum, cell) => sum + (cell.colSpan || 1), 0);
    if (visualCols < 1) return;

    const group = ensureColGroup(table);
    if (!group) return;

    // Ensure colgroup matches visual column count (accounts for colspan).
    while (group.children.length < visualCols) {
      group.appendChild(document.createElement("col"));
    }
    while (group.children.length > visualCols) {
      group.lastElementChild?.remove();
    }

    const tableWidth = Math.max(
      160,
      Math.round(table.getBoundingClientRect().width || editorRef.current?.clientWidth || 480),
    );
    table.style.width = `${tableWidth}px`;
    table.style.maxWidth = "100%";
    table.style.tableLayout = "fixed";

    const evenWidth = Math.max(48, Math.floor(tableWidth / visualCols));
    Array.from(group.children).forEach((colEl) => {
      (colEl as HTMLElement).style.width = `${evenWidth}px`;
    });

    Array.from(table.querySelectorAll("td,th")).forEach((cell) => {
      (cell as HTMLElement).style.width = "";
    });

    updateTableHandlePosition();
    syncEditorValue();
  }

  function fitTableAutoWidth() {
    const { table } = getTargetTable();
    if (!table) {
      toast.warning("Select a table cell first.");
      return;
    }

    // Clear fixed sizing so browser sizes by content.
    table.style.width = "auto";
    table.style.maxWidth = "100%";
    table.style.tableLayout = "auto";
    table.style.minWidth = "0";

    const group = table.querySelector("colgroup");
    if (group) {
      Array.from(group.children).forEach((colEl) => {
        (colEl as HTMLElement).style.width = "";
        (colEl as HTMLElement).style.minWidth = "";
      });
    }

    Array.from(table.querySelectorAll("td,th")).forEach((cell) => {
      const el = cell as HTMLElement;
      el.style.width = "";
      el.style.minWidth = "";
      el.style.maxWidth = "";
      el.style.height = "";
    });

    // Force reflow, measure natural content width, then clamp to editor page width.
    void table.offsetWidth;
    const naturalWidth = Math.ceil(table.getBoundingClientRect().width);
    const pageWidth = Math.max(200, Math.floor((editorRef.current?.clientWidth || 900) - 8));
    const fitted = Math.min(Math.max(naturalWidth, 160), pageWidth);

    table.style.tableLayout = "fixed";
    table.style.width = `${fitted}px`;
    table.style.maxWidth = "100%";
    table.style.minWidth = "0";
    ensureColGroup(table);

    updateTableHandlePosition();
    syncEditorValue();
  }

  function setTablePageLayout(mode: "full" | "center") {
    const { table } = getTargetTable();
    if (!table) {
      toast.warning("Select a table cell first.");
      return;
    }

    const pageWidth = getEditorPageWidth();
    table.style.maxWidth = "100%";
    table.style.minWidth = "0";
    table.style.tableLayout = "fixed";
    table.style.float = "none";
    table.removeAttribute("align");

    if (mode === "full") {
      table.style.width = "100%";
      table.style.marginLeft = "0";
      table.style.marginRight = "0";
      ensureColGroup(table);
      const group = table.querySelector("colgroup");
      if (group && group.children.length) {
        const even = Math.max(48, Math.round(pageWidth / group.children.length));
        Array.from(group.children).forEach((colEl) => {
          (colEl as HTMLElement).style.width = `${even}px`;
        });
      }
      updateTableHandlePosition();
      syncEditorValue();
      return;
    }

    // Center with comfortable mid size (not tiny content-width, not full page).
    applyComfortableTableSize(table, { center: true });
    updateTableHandlePosition();
    syncEditorValue();
  }

  function applyCellPadding(padding: number, scope: "cell" | "all") {
    const { cell, table } = getTargetTable();
    if (!table) {
      toast.warning("Select a table cell first.");
      return;
    }

    const safe = Math.max(0, Math.min(48, Math.round(padding)));
    setCellPaddingPx(safe);
    const value = `${safe}px`;

    if (scope === "cell") {
      if (!cell) {
        toast.warning("Select a table cell first.");
        return;
      }
      cell.style.padding = value;
      updateTableHandlePosition();
      syncEditorValue();
      toast.success(`Cell padding set to ${safe}px.`);
      return;
    }

    Array.from(table.querySelectorAll("td,th")).forEach((item) => {
      (item as HTMLElement).style.padding = value;
    });
    updateTableHandlePosition();
    syncEditorValue();
    toast.success(`All cells padding set to ${safe}px.`);
  }

  function nudgeCellPadding(delta: number, scope: "cell" | "all") {
    applyCellPadding(cellPaddingPx + delta, scope);
  }

  function applyCellSpacing(spacing: number) {
    const { table } = getTargetTable();
    if (!table) {
      toast.warning("Select a table first.");
      return;
    }

    const safe = Math.max(0, Math.min(24, Math.round(spacing)));
    setCellSpacingPx(safe);

    if (safe === 0) {
      table.style.borderCollapse = "collapse";
      table.style.borderSpacing = "0";
    } else {
      table.style.borderCollapse = "separate";
      table.style.borderSpacing = `${safe}px`;
    }

    updateTableHandlePosition();
    syncEditorValue();
    toast.success(`Cell spacing set to ${safe}px.`);
  }

  function nudgeCellSpacing(delta: number) {
    applyCellSpacing(cellSpacingPx + delta);
  }

  function syncTableStackLabels(table: HTMLTableElement) {
    const firstRow = table.rows[0];
    if (!firstRow) return;

    const labels: string[] = [];
    Array.from(firstRow.cells).forEach((cell) => {
      const span = cell.colSpan || 1;
      const label = (cell.textContent ?? "").trim() || "Info";
      for (let i = 0; i < span; i += 1) {
        labels.push(i === 0 ? label : `${label} ${i + 1}`);
      }
    });

    Array.from(table.rows).forEach((row, rowIndex) => {
      if (rowIndex === 0) {
        row.setAttribute("data-stack-header", "1");
        return;
      }
      row.removeAttribute("data-stack-header");
      let col = 0;
      Array.from(row.cells).forEach((cell) => {
        const span = cell.colSpan || 1;
        const label = labels[col] || `Column ${col + 1}`;
        cell.setAttribute("data-label", label);
        col += span;
      });
    });
  }

  function toggleResponsiveStack() {
    const { table } = getTargetTable();
    if (!table) {
      toast.warning("Select a table first.");
      return;
    }

    const enabled = table.classList.contains("table-stack");
    if (enabled) {
      table.classList.remove("table-stack");
      table.removeAttribute("data-stack");
      Array.from(table.querySelectorAll("[data-label]")).forEach((el) => {
        el.removeAttribute("data-label");
      });
      Array.from(table.querySelectorAll("[data-stack-header]")).forEach((el) => {
        el.removeAttribute("data-stack-header");
      });
      updateTableHandlePosition();
      syncEditorValue();
      toast.success("Responsive stack disabled.");
      return;
    }

    table.classList.add("table-stack");
    table.setAttribute("data-stack", "1");
    syncTableStackLabels(table);
    updateTableHandlePosition();
    syncEditorValue();
    toast.success("Responsive stack enabled for mobile.");
  }

  function insertEmbedVideo() {
    const rawUrl = window.prompt("Paste YouTube or Vimeo URL");
    if (!rawUrl) return;

    const embedUrl = toEmbedUrl(rawUrl);
    if (!embedUrl) {
      window.alert("Only YouTube/Vimeo URLs are allowed.");
      return;
    }

    const iframe =
      `<div class="rich-video-wrap">` +
      `<iframe src="${embedUrl}" title="Embedded video" loading="lazy" ` +
      `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" ` +
      `allowfullscreen></iframe></div><p></p>`;

    focusEditor();
    document.execCommand("insertHTML", false, iframe);
    syncEditorValue();
  }

  function replaceOne() {
    if (!findText.trim()) return;

    const source = isSourceMode ? sourceValue : editorRef.current?.innerHTML ?? "";
    const next = source.replace(findText, replaceText);

    if (next !== source) {
      if (isSourceMode) {
        setSourceValue(next);
      }
      commitHtml(next);
    }
  }

  function replaceAll() {
    if (!findText.trim()) return;

    const source = isSourceMode ? sourceValue : editorRef.current?.innerHTML ?? "";
    const regex = new RegExp(escapeRegExp(findText), "g");
    const next = source.replace(regex, replaceText);

    if (isSourceMode) {
      setSourceValue(next);
    }
    commitHtml(next);
  }

  function focusFind() {
    setShowAdvanced(true);
    window.setTimeout(() => findInputRef.current?.focus(), 0);
  }

  function restoreDraft() {
    const draft = window.localStorage.getItem(storageKey);
    if (!draft) return;
    commitHtml(draft);
    setSourceValue(draft);
    setHasRestorableDraft(false);
  }

  function clearDraft() {
    window.localStorage.removeItem(storageKey);
    setHasRestorableDraft(false);
  }

  async function uploadEditorImage(file: File): Promise<{ url: string } | { error: string }> {
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        return { error: json.error?.trim() || "Image upload failed." };
      }
      return { url: json.url };
    } catch {
      return { error: "Network error during image upload." };
    }
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const valid = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    if (!valid.length) {
      toast.warning("Please choose image files only.");
      return;
    }

    const nextItems: UploadedImage[] = [];
    let lastError = "";

    for (const file of valid.slice(0, 8)) {
      const result = await uploadEditorImage(file);
      if ("error" in result) {
        lastError = result.error;
        continue;
      }
      nextItems.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        url: result.url,
      });
    }

    if (nextItems.length) {
      setUploadedImages((prev) => [...nextItems, ...prev].slice(0, 12));
      toast.success(
        nextItems.length === 1
          ? "Image uploaded."
          : `${nextItems.length} images uploaded.`,
      );
    } else if (lastError) {
      toast.error(lastError);
    }
  }

  function insertUploadedImage(imageUrl: string, imageName: string) {
    const initialAlt = imageName.replace(/\.[^/.]+$/, "").trim() || "uploaded-image";
    const altText = (window.prompt("Enter image alt text", initialAlt) ?? "").trim() || initialAlt;
    const safeAlt = altText.replace(/"/g, "&quot;");
    focusEditor();
    document.execCommand(
      "insertHTML",
      false,
      `<img src="${imageUrl}" alt="${safeAlt}" width="1200" height="675" style="display:block;width:100%;max-width:520px;height:auto;aspect-ratio:1200/675;object-fit:cover;margin:12px auto;border-radius:8px;" /><p></p>`,
    );
    syncEditorValue();
  }

  function removeUploadedImage(id: string) {
    setUploadedImages((prev) => prev.filter((item) => item.id !== id));
  }

  function handleEditorDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void handleFiles(event.dataTransfer.files);
  }

  function handleEditorPaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const files = event.clipboardData.files;
    if (files && files.length > 0) {
      event.preventDefault();
      void handleFiles(files);
    }
  }

  function ensureEditableRoot() {
    const el = editorRef.current;
    if (!el) return;
    if (!el.innerHTML.trim()) {
      el.innerHTML = "<p><br></p>";
      syncEditorValue();
    }
  }

  function exitBlockquoteToParagraph() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    let anchor: Node | null = selection.anchorNode;
    if (!anchor) return false;
    if (anchor.nodeType === Node.TEXT_NODE) {
      anchor = anchor.parentElement;
    }

    const blockquote = (anchor as HTMLElement | null)?.closest("blockquote");
    if (!blockquote || !blockquote.parentNode) return false;

    const paragraph = document.createElement("p");
    paragraph.appendChild(document.createElement("br"));

    if (blockquote.nextSibling) {
      blockquote.parentNode.insertBefore(paragraph, blockquote.nextSibling);
    } else {
      blockquote.parentNode.appendChild(paragraph);
    }

    const caret = document.createRange();
    caret.setStart(paragraph, 0);
    caret.collapse(true);
    selection.removeAllRanges();
    selection.addRange(caret);

    return true;
  }

  function exitHorizontalRuleToParagraph() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const root = editorRef.current;
    if (!root) return false;

    const range = selection.getRangeAt(0);
    let anchor: Node | null = selection.anchorNode;
    if (!anchor) return false;
    if (anchor.nodeType === Node.TEXT_NODE) {
      anchor = anchor.parentElement;
    }

    let hr: HTMLHRElement | null = null;

    if ((anchor as HTMLElement).tagName === "HR") {
      hr = anchor as HTMLHRElement;
    } else if (range.collapsed && range.startContainer === root) {
      const index = Math.max(0, range.startOffset - 1);
      const node = root.childNodes[index];
      if (node instanceof HTMLHRElement) {
        hr = node;
      }
    } else if (anchor instanceof HTMLElement) {
      const prev = anchor.previousElementSibling;
      if (prev instanceof HTMLHRElement) {
        hr = prev;
      } else if (anchor.tagName === "P" && (anchor.innerHTML.trim() === "<br>" || anchor.textContent?.trim() === "")) {
        const pPrev = anchor.previousElementSibling;
        if (pPrev instanceof HTMLHRElement) {
          hr = pPrev;
        }
      }
    }

    if (!hr || !hr.parentNode) return false;

    const paragraph = document.createElement("p");
    paragraph.appendChild(document.createElement("br"));

    if (hr.nextSibling) {
      hr.parentNode.insertBefore(paragraph, hr.nextSibling);
    } else {
      hr.parentNode.appendChild(paragraph);
    }

    const caret = document.createRange();
    caret.setStart(paragraph, 0);
    caret.collapse(true);
    selection.removeAllRanges();
    selection.addRange(caret);

    return true;
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
      event.preventDefault();
      focusFind();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === "?") {
      event.preventDefault();
      setShowHelp((prev) => !prev);
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      focusEditor();
      if (exitBlockquoteToParagraph()) {
        event.preventDefault();
        onEditorInput();
        return;
      }
      if (exitHorizontalRuleToParagraph()) {
        event.preventDefault();
        onEditorInput();
        return;
      }
      window.setTimeout(() => onEditorInput(), 0);
      return;
    }

    if (event.key === "Enter" && event.shiftKey) {
      window.setTimeout(() => onEditorInput(), 0);
      return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
      window.setTimeout(() => {
        onEditorInput();
      }, 0);
    }
  }

  return (
    <div className={`rich-editor ${isFullscreen ? "rich-editor-fullscreen" : ""}`}>
      {hasRestorableDraft ? (
        <div className="rich-editor-draft-banner">
          <span>Draft found from previous session.</span>
          <div>
            <button type="button" onClick={restoreDraft} title="Restore draft">
              Restore
            </button>
            <button type="button" onClick={clearDraft} title="Clear draft">
              Clear
            </button>
          </div>
        </div>
      ) : null}

      <div className="rich-editor-toolbar">
        <select
          title="Headings"
          aria-label="Headings"
          value={headingValue}
          onChange={(e) => {
            const selected = Number(e.target.value);
            if (selected >= 0 && selected <= 8) {
              applyHeading(selected);
              setHeadingValue(e.target.value);
            }
          }}
        >
          <option value="" disabled>
            H
          </option>
          <option value="0">Paragraph</option>
          <option value="1">H1</option>
          <option value="2">H2</option>
          <option value="3">H3</option>
          <option value="4">H4</option>
          <option value="5">H5</option>
          <option value="6">H6</option>
          <option value="7">H7</option>
          <option value="8">H8</option>
        </select>

        <button type="button" title="Bold" aria-label="Bold" onClick={() => runCommand("bold")}>
          <b>B</b>
        </button>
        <button type="button" title="Italic" aria-label="Italic" onClick={() => runCommand("italic")}>
          <i>I</i>
        </button>
        <button type="button" title="Underline" aria-label="Underline" onClick={() => runCommand("underline")}>
          <u>U</u>
        </button>
        <button
          type="button"
          title="Bulleted List"
          aria-label="Bulleted List"
          onClick={() => runCommand("insertUnorderedList")}
        >
          {"\u2022"}
        </button>
        <button
          type="button"
          title="Numbered List"
          aria-label="Numbered List"
          onClick={() => runCommand("insertOrderedList")}
        >
          1.
        </button>
        <button
          type="button"
          title="Insert Link"
          aria-label="Insert Link"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertLink}
        >
          {"\u221E"}
        </button>
        <button type="button" title="Insert Image URL" aria-label="Insert Image URL" onClick={insertImageByUrl}>
          {"\u25A3"}
        </button>
        <button
          type="button"
          title="Upload Images"
          aria-label="Upload Images"
          onClick={() => uploadInputRef.current?.click()}
        >
          IMG+
        </button>
        <button type="button" title="Undo" aria-label="Undo" onClick={() => runCommand("undo")}>
          {"\u21BA"}
        </button>
        <button type="button" title="Redo" aria-label="Redo" onClick={() => runCommand("redo")}>
          {"\u21BB"}
        </button>
        <button
          type="button"
          title="Blockquote"
          aria-label="Blockquote"
          onClick={() => runCommand("formatBlock", "BLOCKQUOTE")}
        >
          &quot;
        </button>
        <button type="button" title="Comment" aria-label="Comment" onClick={insertCommentBlock}>
          Cmt
        </button>
        <button type="button" title="Code Block" aria-label="Code Block" onClick={insertCodeBlock}>
          {"</>"}
        </button>
        <button type="button" title="Align Left" aria-label="Align Left" onClick={() => runCommand("justifyLeft")}>
          L
        </button>
        <button
          type="button"
          title="Align Center"
          aria-label="Align Center"
          onClick={() => runCommand("justifyCenter")}
        >
          C
        </button>
        <button type="button" title="Align Right" aria-label="Align Right" onClick={() => runCommand("justifyRight")}>
          R
        </button>
        <button type="button" title="Clear Formatting" aria-label="Clear Formatting" onClick={clearFormatting}>
          Tx
        </button>
        <div
          ref={tablePickerAnchorRef}
          className="table-picker-wrap"
          onMouseEnter={openTablePicker}
          onMouseLeave={closeTablePicker}
        >
          <button type="button" title="Insert Table" aria-label="Insert Table" onClick={insertTable}>
            Tbl+
          </button>
        </div>
        <button type="button" title="Embed Video" aria-label="Embed Video" onClick={insertEmbedVideo}>
          Vid
        </button>
        <button type="button" title="Find" aria-label="Find" onClick={focusFind}>
          F
        </button>
        <button type="button" title="Fullscreen" aria-label="Fullscreen" onClick={() => setIsFullscreen((prev) => !prev)}>
          {isFullscreen ? "Min" : "Full"}
        </button>
        <button
          type="button"
          title={isSourceMode ? "Preview Mode" : "HTML Source Mode"}
          aria-label={isSourceMode ? "Preview Mode" : "HTML Source Mode"}
          className={isSourceMode ? "is-active" : ""}
          onClick={() => onSourceModeToggle(!isSourceMode)}
        >
          {isSourceMode ? "PRV" : "</>"}
        </button>
        <button type="button" title="Shortcuts Help" aria-label="Shortcuts Help" onClick={() => setShowHelp((prev) => !prev)}>
          ?
        </button>

        <button
          type="button"
          className="rich-editor-more-btn"
          title={showAdvanced ? "Hide advanced buttons" : "Show advanced buttons"}
          onClick={() => setShowAdvanced((prev) => !prev)}
        >
          {showAdvanced ? "Less" : "More"}
        </button>
      </div>

      <div
        className={`rich-editor-table-toolbar${tableHandle.visible ? "" : " is-hidden"}`}
        role="toolbar"
        aria-label="Table tools"
        aria-hidden={!tableHandle.visible}
      >
          <span className="rich-editor-table-toolbar-label">Table tools</span>
          <button type="button" title="Insert row above" onMouseDown={(e) => e.preventDefault()} onClick={() => insertTableRow("above")}>
            Row↑
          </button>
          <button type="button" title="Insert row below" onMouseDown={(e) => e.preventDefault()} onClick={() => insertTableRow("below")}>
            Row↓
          </button>
          <button type="button" title="Insert column left" onMouseDown={(e) => e.preventDefault()} onClick={() => insertTableColumn("left")}>
            Col←
          </button>
          <button type="button" title="Insert column right" onMouseDown={(e) => e.preventDefault()} onClick={() => insertTableColumn("right")}>
            Col→
          </button>
          <button type="button" title="Delete row" onMouseDown={(e) => e.preventDefault()} onClick={deleteTableRow}>
            Row-
          </button>
          <button type="button" title="Delete column" onMouseDown={(e) => e.preventDefault()} onClick={deleteTableColumn}>
            Col-
          </button>
          <button type="button" title="Delete table" onMouseDown={(e) => e.preventDefault()} onClick={deleteWholeTable}>
            Tbl-
          </button>
          <button type="button" title="Make table smaller" onMouseDown={(e) => e.preventDefault()} onClick={() => nudgeTableWidth("smaller")}>
            W−
          </button>
          <button type="button" title="Make table larger" onMouseDown={(e) => e.preventDefault()} onClick={() => nudgeTableWidth("larger")}>
            W+
          </button>
          <button type="button" title="Fit to content/page" onMouseDown={(e) => e.preventDefault()} onClick={fitTableAutoWidth}>
            FitW
          </button>
          <button type="button" title="Full width table" onMouseDown={(e) => e.preventDefault()} onClick={() => setTablePageLayout("full")}>
            FullW
          </button>
          <button type="button" title="Center table on page" onMouseDown={(e) => e.preventDefault()} onClick={() => setTablePageLayout("center")}>
            Center
          </button>
          <button type="button" title="Equal column widths" onMouseDown={(e) => e.preventDefault()} onClick={distributeColumnsEvenly}>
            EqCol
          </button>
          <button type="button" title="Toggle header row" onMouseDown={(e) => e.preventDefault()} onClick={toggleTableHeaderRow}>
            Hdr
          </button>
          <button type="button" title="Merge right" onMouseDown={(e) => e.preventDefault()} onClick={mergeCellWithRight}>
            M→
          </button>
          <button type="button" title="Merge below" onMouseDown={(e) => e.preventDefault()} onClick={mergeCellWithBelow}>
            M↓
          </button>
          <button type="button" title="Split cell" onMouseDown={(e) => e.preventDefault()} onClick={splitTableCell}>
            Split
          </button>
          <button type="button" title="Align left" onMouseDown={(e) => e.preventDefault()} onClick={() => alignCellText("left")}>
            CL
          </button>
          <button type="button" title="Align center" onMouseDown={(e) => e.preventDefault()} onClick={() => alignCellText("center")}>
            CC
          </button>
          <button type="button" title="Align right" onMouseDown={(e) => e.preventDefault()} onClick={() => alignCellText("right")}>
            CR
          </button>
          <label className="rich-editor-color-picker" title="Cell background">
            BG
            <input
              type="color"
              value={cellBgColor}
              onMouseDown={(e) => e.preventDefault()}
              onChange={(e) => {
                const next = e.target.value;
                setCellBgColor(next);
                applyCellBackground(next);
              }}
            />
          </label>
          <button type="button" title="Clear background" onMouseDown={(e) => e.preventDefault()} onClick={clearCellBackground}>
            BG×
          </button>
          <label className="rich-editor-color-picker" title="Cell border color">
            BD
            <input
              type="color"
              value={cellBorderColor}
              onMouseDown={(e) => e.preventDefault()}
              onChange={(e) => {
                const next = e.target.value;
                setCellBorderColor(next);
                applyCellBorder(next);
              }}
            />
          </label>
          <button type="button" title="Solid border" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCellBorderStyle("solid")}>
            BD|
          </button>
          <button type="button" title="Dashed border" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCellBorderStyle("dashed")}>
            BD…
          </button>
          <button type="button" title="Remove border" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCellBorderStyle("none")}>
            BD×
          </button>
          <button type="button" title="Copy table" onMouseDown={(e) => e.preventDefault()} onClick={() => void copyWholeTable()}>
            CopyTbl
          </button>
          <button type="button" title="Paste table" onMouseDown={(e) => e.preventDefault()} onClick={pasteWholeTable}>
            PasteTbl
          </button>
          <button type="button" title="Sort column" onMouseDown={(e) => e.preventDefault()} onClick={sortTableByColumn}>
            Sort
          </button>
          <button type="button" title="Move row up" onMouseDown={(e) => e.preventDefault()} onClick={() => moveTableRow("up")}>
            Row⇑
          </button>
          <button type="button" title="Move row down" onMouseDown={(e) => e.preventDefault()} onClick={() => moveTableRow("down")}>
            Row⇓
          </button>
          <button type="button" title="Move column left" onMouseDown={(e) => e.preventDefault()} onClick={() => moveTableColumn("left")}>
            Col⇐
          </button>
          <button type="button" title="Move column right" onMouseDown={(e) => e.preventDefault()} onClick={() => moveTableColumn("right")}>
            Col⇒
          </button>
          <button type="button" title="Duplicate row" onMouseDown={(e) => e.preventDefault()} onClick={duplicateTableRow}>
            DupRow
          </button>
          <button type="button" title="Duplicate column" onMouseDown={(e) => e.preventDefault()} onClick={duplicateTableColumn}>
            DupCol
          </button>
          <button type="button" title="Clear cell" onMouseDown={(e) => e.preventDefault()} onClick={clearTableCell}>
            ClrCell
          </button>
          <button type="button" title="Clear row" onMouseDown={(e) => e.preventDefault()} onClick={clearTableRow}>
            ClrRow
          </button>
          <button type="button" title="Decrease padding" onMouseDown={(e) => e.preventDefault()} onClick={() => nudgeCellPadding(-2, "cell")}>
            Pad−
          </button>
          <input
            className="rich-editor-find-input rich-editor-pad-input"
            type="number"
            min={0}
            max={48}
            value={cellPaddingPx}
            title="Cell padding (px)"
            onMouseDown={(e) => e.preventDefault()}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (!Number.isFinite(next)) return;
              applyCellPadding(next, "cell");
            }}
          />
          <button type="button" title="Increase padding" onMouseDown={(e) => e.preventDefault()} onClick={() => nudgeCellPadding(2, "cell")}>
            Pad+
          </button>
          <button type="button" title="Apply padding to all cells" onMouseDown={(e) => e.preventDefault()} onClick={() => applyCellPadding(cellPaddingPx, "all")}>
            PadAll
          </button>
          <button type="button" title="Decrease spacing" onMouseDown={(e) => e.preventDefault()} onClick={() => nudgeCellSpacing(-1)}>
            Spc−
          </button>
          <input
            className="rich-editor-find-input rich-editor-pad-input"
            type="number"
            min={0}
            max={24}
            value={cellSpacingPx}
            title="Cell spacing (px)"
            onMouseDown={(e) => e.preventDefault()}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (!Number.isFinite(next)) return;
              applyCellSpacing(next);
            }}
          />
          <button type="button" title="Increase spacing" onMouseDown={(e) => e.preventDefault()} onClick={() => nudgeCellSpacing(1)}>
            Spc+
          </button>
          <button type="button" title="Mobile stack cards" onMouseDown={(e) => e.preventDefault()} onClick={toggleResponsiveStack}>
            Stack
          </button>
        </div>
      <p className={`rich-editor-table-hint${tableHandle.visible ? " is-hidden" : ""}`}>
        Table tools: pehle table cell pe click karo, tools yahan dikhenge.
      </p>

      {tablePickerOpen ? (
        <div
          className="table-picker-popover table-picker-popover-fixed"
          style={{ top: tablePickerPos.top, left: tablePickerPos.left }}
          onMouseEnter={openTablePicker}
          onMouseLeave={closeTablePicker}
        >
          <div className="table-picker-grid">
            {Array.from({ length: TABLE_PICKER_ROWS }).map((_, r) =>
              Array.from({ length: TABLE_PICKER_COLS }).map((__, c) => {
                const rows = r + 1;
                const cols = c + 1;
                const active = rows <= tablePickerRows && cols <= tablePickerCols;
                return (
                  <button
                    key={`tp-${rows}-${cols}`}
                    type="button"
                    className={`table-picker-cell ${active ? "is-active" : ""}`}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      tablePickerSelectionRef.current.active = true;
                      markTablePickerCell(rows, cols);
                    }}
                    onMouseEnter={() => {
                      if (tablePickerSelectionRef.current.active) {
                        markTablePickerCell(rows, cols);
                      }
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      insertTableWithSize(rows, cols);
                      setTablePickerOpen(false);
                      setTablePickerRows(0);
                      setTablePickerCols(0);
                    }}
                    title={`${rows} x ${cols}`}
                  />
                );
              }),
            )}
          </div>
          <p className="table-picker-label">
            {tablePickerRows > 0 && tablePickerCols > 0
              ? `${tablePickerRows} x ${tablePickerCols}`
              : "Drag to select"}
          </p>
        </div>
      ) : null}

      {linkPopover.open ? (
        <div
          className="rich-link-popover"
          style={{ top: linkPopover.top, left: linkPopover.left }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <input
            ref={linkInputRef}
            type="url"
            className="rich-link-popover-input"
            placeholder="https://example.com"
            value={linkPopover.url}
            onChange={(e) => setLinkPopover((prev) => ({ ...prev, url: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                closeLinkPopover();
              }
            }}
            aria-label="Enter URL"
          />
          <button type="button" className="rich-link-popover-apply" onClick={applyLink} title="Apply link">
            Link
          </button>
          {linkPopover.url.trim() ? (
            <button
              type="button"
              className="rich-link-popover-cancel"
              onClick={removeLinkFromPopover}
              title="Remove link"
            >
              Unlink
            </button>
          ) : null}
          <button type="button" className="rich-link-popover-cancel" onClick={closeLinkPopover} title="Cancel">
            ✕
          </button>
        </div>
      ) : null}

      {showAdvanced ? (
        <div className="rich-editor-toolbar rich-editor-toolbar-advanced">
          <select
            title="Font Family"
            aria-label="Font Family"
            value={fontFamily}
            onChange={(e) => {
              const next = e.target.value;
              setFontFamily(next);
              runCommand("fontName", next);
            }}
          >
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Tahoma">Tahoma</option>
            <option value="Times New Roman">Times</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier</option>
          </select>

          <select
            title="Font Size"
            aria-label="Font Size"
            value={fontSize}
            onChange={(e) => {
              const next = e.target.value;
              setFontSize(next);
              runCommand("fontSize", next);
            }}
          >
            <option value="1">XS</option>
            <option value="2">S</option>
            <option value="3">M</option>
            <option value="4">L</option>
            <option value="5">XL</option>
            <option value="6">2XL</option>
            <option value="7">3XL</option>
          </select>

          <label className="rich-editor-color-picker" title="Text Color">
            A
            <input
              type="color"
              value={textColor}
              onChange={(e) => {
                const next = e.target.value;
                setTextColor(next);
                runCommand("foreColor", next);
              }}
            />
          </label>

          <label className="rich-editor-color-picker" title="Highlight Color">
            H
            <input
              type="color"
              value={highlightColor}
              onChange={(e) => {
                const next = e.target.value;
                setHighlightColor(next);
                runCommand("hiliteColor", next);
              }}
            />
          </label>
          <button type="button" title="Green Left Line" onClick={toggleLeftLineAccent}>
            GL
          </button>

          <input
            ref={findInputRef}
            className="rich-editor-find-input"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Find"
            title="Find"
          />
          <input
            className="rich-editor-find-input"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            placeholder="Replace"
            title="Replace"
          />
          <button type="button" title="Replace Next" onClick={replaceOne}>Rep</button>
          <button type="button" title="Replace All" onClick={replaceAll}>All</button>
          <button type="button" title="Justify" aria-label="Justify" onClick={() => runCommand("justifyFull")}>
            J
          </button>
          <button type="button" title="Horizontal Line" aria-label="Horizontal Line" onClick={() => runCommand("insertHorizontalRule")}>
            ---
          </button>
        </div>
      ) : null}

      <input
        ref={uploadInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        hidden
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.currentTarget.value = "";
        }}
      />

      {uploadedImages.length ? (
        <div className="rich-editor-uploads">
          {uploadedImages.map((item) => (
            <div key={item.id} className="rich-editor-upload-card">
              <img src={item.url} alt={item.name} loading="lazy" />
              <div className="rich-editor-upload-actions">
                <button type="button" onClick={() => insertUploadedImage(item.url, item.name)} title="Insert image">
                  Insert
                </button>
                <button type="button" onClick={() => removeUploadedImage(item.id)} title="Remove image">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {showHelp ? (
        <div className="rich-editor-help">
          <strong>Keyboard Shortcuts</strong>
          <p>Ctrl/Cmd + B: Bold</p>
          <p>Ctrl/Cmd + I: Italic</p>
          <p>Ctrl/Cmd + U: Underline</p>
          <p>Ctrl/Cmd + F: Find panel</p>
          <p>Ctrl/Cmd + Shift + ?: Toggle help</p>
        </div>
      ) : null}

      {isSourceMode ? (
        <div className="rich-editor-editable-wrap">
          <textarea
            value={sourceValue}
            onChange={(e) => setSourceValue(e.target.value)}
            rows={14}
            style={{ height: `${editorHeight}px` }}
            placeholder="Write article content HTML..."
          />
          <button
            type="button"
            className="rich-editor-resize-handle"
            title="Drag to resize editor"
            aria-label="Drag to resize editor"
            onMouseDown={startEditorResize}
          />
        </div>
      ) : (
        <div className="rich-editor-editable-wrap">
          <div
            ref={(node) => {
              editorRef.current = node;
              // Seed HTML on first attach so refresh does not flash empty → content.
              if (node && node.dataset.seeded !== "1") {
                node.innerHTML = value || "";
                lastEmittedHtmlRef.current = value || "";
                node.dataset.seeded = "1";
              }
            }}
            className="rich-editor-content"
            style={{ height: `${editorHeight}px` }}
            contentEditable
            suppressContentEditableWarning
            onFocus={() => {
              ensureEditableRoot();
              // Selection is often not updated yet on focus — calling setActiveTableFromSelection
              // here was hiding Table tools for a frame (blink). Wait for selectionchange/click.
              window.setTimeout(() => {
                setActiveTableFromSelection();
                syncHeadingFromSelection();
              }, 0);
            }}
            onMouseDown={onEditorMouseDown}
            onMouseMove={onEditorMouseMove}
            onMouseLeave={() => {
              if (editorRef.current) editorRef.current.style.cursor = "";
            }}
            onClick={handleEditorClick}
            onKeyUp={() => {
              setActiveTableFromSelection();
              syncHeadingFromSelection();
            }}
            onInput={() => {
              onEditorInput();
              setActiveTableFromSelection();
              syncHeadingFromSelection();
              // Typing in a cell should hide the in-cell + control.
              const cell = getCurrentCell();
              activeCellRef.current = cell;
              updateCellPlusPosition();
            }}
            onBlur={() => {
              onEditorBlur();
              window.setTimeout(() => {
                if (dragStateRef.current || tableResizeRef.current) return;
                const activeEl = document.activeElement as HTMLElement | null;
                if (activeEl?.closest?.(".rich-editor-table-toolbar, .table-drag-handle, .table-cell-plus")) {
                  return;
                }
                setActiveTableFromSelection();
              }, 0);
            }}
            onDrop={handleEditorDrop}
            onDragOver={(e) => e.preventDefault()}
            onPaste={handleEditorPaste}
            onKeyDown={handleKeyDown}
          />
          {tableHandle.visible ? (
            <>
              <button
                type="button"
                className="table-drag-handle table-drag-col"
                title="Click: add column | Drag: add/remove columns"
                style={{
                  top: `${tableHandle.top + Math.max(0, tableHandle.height / 2) - 9}px`,
                  left: `${tableHandle.left + tableHandle.width - 9}px`,
                }}
                onMouseDown={(e) => startTableDrag("col", e)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addTableColumn();
                }}
              >
                +
              </button>
              <button
                type="button"
                className="table-drag-handle table-drag-row"
                title="Click: add row below | Drag: add/remove rows"
                style={{
                  top: `${tableHandle.top + tableHandle.height - 9}px`,
                  left: `${tableHandle.left + Math.max(0, tableHandle.width / 2) - 9}px`,
                }}
                onMouseDown={(e) => startTableDrag("row", e)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addTableRow();
                }}
              >
                +
              </button>
              <button
                type="button"
                className="table-drag-handle table-drag-size"
                title="Drag left/right to resize table width"
                style={{
                  top: `${tableHandle.top + tableHandle.height - 14}px`,
                  left: `${tableHandle.left + tableHandle.width - 14}px`,
                }}
                onMouseDown={startTableWidthResize}
              >
                ↘
              </button>
            </>
          ) : null}
          {cellPlus.visible ? (
            <div
              className="table-cell-plus"
              style={{ top: `${cellPlus.top}px`, left: `${cellPlus.left}px` }}
            >
              <button
                type="button"
                className="table-cell-plus-btn"
                title="Add row or column"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCellPlus((prev) => ({ ...prev, menuOpen: !prev.menuOpen }));
                }}
              >
                +
              </button>
              {cellPlus.menuOpen ? (
                <div className="table-cell-plus-menu" role="menu">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addTableRow();
                      setCellPlus((prev) => ({ ...prev, menuOpen: false }));
                      window.setTimeout(() => updateCellPlusPosition(), 0);
                    }}
                  >
                    + Row
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addTableColumn();
                      setCellPlus((prev) => ({ ...prev, menuOpen: false }));
                      window.setTimeout(() => updateCellPlusPosition(), 0);
                    }}
                  >
                    + Col
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
          <button
            type="button"
            className="rich-editor-resize-handle"
            title="Drag to resize editor"
            aria-label="Drag to resize editor"
            onMouseDown={startEditorResize}
          />
        </div>
      )}

      <div className="rich-editor-footer">
        <span>Words: {plainText.trim() ? plainText.trim().split(/\s+/).length : 0}</span>
        <span>Characters: {plainText.length}</span>
      </div>
    </div>
  );
}
