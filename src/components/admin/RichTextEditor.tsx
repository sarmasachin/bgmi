"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

type UploadedImage = {
  id: string;
  name: string;
  url: string;
};

const STORAGE_KEY = "bgmi_admin_news_editor_draft_v1";
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

export function RichTextEditor({ value, onChange }: Props) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const findInputRef = useRef<HTMLInputElement | null>(null);
  const tablePickerAnchorRef = useRef<HTMLDivElement | null>(null);
  const tablePickerHideTimerRef = useRef<number | null>(null);
  const resizeStateRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const tablePickerSelectionRef = useRef({
    active: false,
    rows: 0,
    cols: 0,
  });
  const activeTableRef = useRef<HTMLTableElement | null>(null);
  const dragStateRef = useRef<{
    kind: "row" | "col";
    startX: number;
    startY: number;
    startRows: number;
    startCols: number;
  } | null>(null);
  const typingRef = useRef(false);
  const typingTimerRef = useRef<number | null>(null);

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

  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");

  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const [tablePickerRows, setTablePickerRows] = useState(0);
  const [tablePickerCols, setTablePickerCols] = useState(0);
  const [tablePickerPos, setTablePickerPos] = useState({ top: 0, left: 0 });
  const [editorHeight, setEditorHeight] = useState(360);
  const [headingValue, setHeadingValue] = useState("");
  const [tableHandle, setTableHandle] = useState({
    visible: false,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setSourceValue(value);
    if (!isSourceMode && !typingRef.current && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value, isSourceMode]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        window.clearTimeout(typingTimerRef.current);
      }
      if (tablePickerHideTimerRef.current) {
        window.clearTimeout(tablePickerHideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (value.trim()) {
        window.localStorage.setItem(STORAGE_KEY, value);
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [value]);

  useEffect(() => {
    const draft = window.localStorage.getItem(STORAGE_KEY);
    if (!draft) return;

    const current = value.trim();
    const isDefault = current === "" || current === "<p>Start writing...</p>";

    if (isDefault) {
      onChange(draft);
      return;
    }

    if (draft !== current) {
      setHasRestorableDraft(true);
    }
  }, [onChange, value]);

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
    onChange(safe);

    if (!isSourceMode && editorRef.current && editorRef.current.innerHTML !== safe) {
      editorRef.current.innerHTML = safe;
    }
  }

  function syncEditorValue() {
    onChange(editorRef.current?.innerHTML ?? "");
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
    document.execCommand("styleWithCSS", false, "true");
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
      setHeadingValue("");
      return;
    }

    let element = anchor.nodeType === Node.TEXT_NODE ? anchor.parentElement : (anchor as HTMLElement | null);

    while (element && element !== editor) {
      const tag = element.tagName.toLowerCase();
      if (tag === "h1") return setHeadingValue("1");
      if (tag === "h2") return setHeadingValue("2");
      if (tag === "h3") return setHeadingValue("3");
      if (tag === "h4") return setHeadingValue("4");
      if (tag === "h5") return setHeadingValue("5");
      if (tag === "h6") return setHeadingValue("6");
      if (element.classList.contains("rich-h7")) return setHeadingValue("7");
      if (element.classList.contains("rich-h8")) return setHeadingValue("8");
      element = element.parentElement;
    }

    setHeadingValue("0");
  }

  function insertLink() {
    const url = window.prompt("Enter URL");
    if (!url) return;
    runCommand("createLink", url);
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

  function updateTableHandlePosition() {
    const editor = editorRef.current;
    const table = activeTableRef.current;
    if (!editor || !table || !table.isConnected) {
      setTableHandle((prev) => ({ ...prev, visible: false }));
      return;
    }

    const tableRect = table.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();

    setTableHandle({
      visible: true,
      top: tableRect.top - editorRect.top + editor.scrollTop,
      left: tableRect.left - editorRect.left + editor.scrollLeft,
      width: tableRect.width,
      height: tableRect.height,
    });
  }

  function setActiveTableFromSelection() {
    activeTableRef.current = getActiveTableFromSelection();
    updateTableHandlePosition();
  }

  function setTableColumnCount(table: HTMLTableElement, targetCols: number) {
    const safeTarget = Math.max(1, Math.min(20, targetCols));
    const currentCols = table.rows[0]?.cells.length ?? 0;
    if (!currentCols) return;

    if (safeTarget > currentCols) {
      const toAdd = safeTarget - currentCols;
      Array.from(table.rows).forEach((row) => {
        for (let i = 0; i < toAdd; i += 1) {
          row.insertCell().textContent = "Cell";
        }
      });
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
          row.insertCell().textContent = "Cell";
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

  function startTableDrag(kind: "row" | "col", event: React.MouseEvent<HTMLButtonElement>) {
    const table = activeTableRef.current;
    if (!table) return;

    event.preventDefault();
    event.stopPropagation();

    dragStateRef.current = {
      kind,
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

      const drag = dragStateRef.current;
      const table = activeTableRef.current;
      if (!drag || !table) return;

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

      updateTableHandlePosition();
      syncEditorValue();
    };

    const onMouseUp = () => {
      if (resizeStateRef.current) {
        resizeStateRef.current = null;
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

  function insertTableWithSize(rows: number, cols: number) {
    if (!rows || !cols || rows < 1 || cols < 1) return;
    const safeRows = Math.min(rows, 12);
    const safeCols = Math.min(cols, 12);

    let html = "<table><tbody>";
    for (let r = 0; r < safeRows; r += 1) {
      html += "<tr>";
      for (let c = 0; c < safeCols; c += 1) {
        html += `<td>Cell ${r + 1}-${c + 1}</td>`;
      }
      html += "</tr>";
    }
    html += "</tbody></table><p></p>";

    focusEditor();
    document.execCommand("insertHTML", false, html);
    syncEditorValue();
    window.setTimeout(() => {
      const lastTable = editorRef.current?.querySelector("table:last-of-type") as HTMLTableElement | null;
      if (lastTable) {
        activeTableRef.current = lastTable;
        updateTableHandlePosition();
      }
    }, 0);
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

  function addTableRow() {
    const { cell, table } = getTargetTable();
    if (!table) return;

    const row = cell?.parentElement as HTMLTableRowElement | null;
    const insertAt = row ? row.rowIndex + 1 : table.rows.length;
    const colCount = table.rows[0]?.cells.length ?? row?.cells.length ?? 1;

    const newRow = table.insertRow(insertAt);
    for (let i = 0; i < colCount; i += 1) {
      newRow.insertCell().textContent = "Cell";
    }

    syncEditorValue();
  }

  function addTableColumn() {
    const { cell, table } = getTargetTable();
    if (!table) return;

    const colIndex = cell ? cell.cellIndex : (table.rows[0]?.cells.length ?? 1) - 1;
    Array.from(table.rows).forEach((row) => {
      const newCell = row.insertCell(colIndex + 1);
      newCell.textContent = "Cell";
    });

    syncEditorValue();
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

    syncEditorValue();
  }

  function deleteTableColumn() {
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

    if (table.rows[0] && table.rows[0].cells.length === 0) {
      table.remove();
    }

    syncEditorValue();
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
    const draft = window.localStorage.getItem(STORAGE_KEY);
    if (!draft) return;
    commitHtml(draft);
    setSourceValue(draft);
    setHasRestorableDraft(false);
  }

  function clearDraft() {
    window.localStorage.removeItem(STORAGE_KEY);
    setHasRestorableDraft(false);
  }

  async function uploadEditorImage(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/admin/media/upload", {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    const json = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !json.url) {
      return null;
    }
    return json.url;
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const valid = Array.from(fileList).filter((file) => file.type.startsWith("image/"));
    if (!valid.length) return;

    const nextItems: UploadedImage[] = [];

    for (const file of valid.slice(0, 8)) {
      try {
        const url = await uploadEditorImage(file);
        if (!url) continue;
        nextItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          url,
        });
      } catch {
        // Ignore individual file failures and continue with others.
      }
    }

    if (nextItems.length) {
      setUploadedImages((prev) => [...nextItems, ...prev].slice(0, 12));
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
      onChange(el.innerHTML);
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
        <button type="button" title="Insert Link" aria-label="Insert Link" onClick={insertLink}>
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
        <button
          type="button"
          title="Add Table Row"
          aria-label="Add Table Row"
          onMouseDown={(e) => e.preventDefault()}
          onClick={addTableRow}
        >
          Row+
        </button>
        <button
          type="button"
          title="Add Table Column"
          aria-label="Add Table Column"
          onMouseDown={(e) => e.preventDefault()}
          onClick={addTableColumn}
        >
          Col+
        </button>
        <button
          type="button"
          title="Delete Table Row"
          aria-label="Delete Table Row"
          onMouseDown={(e) => e.preventDefault()}
          onClick={deleteTableRow}
        >
          Row-
        </button>
        <button
          type="button"
          title="Delete Table Column"
          aria-label="Delete Table Column"
          onMouseDown={(e) => e.preventDefault()}
          onClick={deleteTableColumn}
        >
          Col-
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
            ref={editorRef}
            className="rich-editor-content"
            style={{ height: `${editorHeight}px` }}
            contentEditable
            suppressContentEditableWarning
            onFocus={() => {
              ensureEditableRoot();
              setActiveTableFromSelection();
              syncHeadingFromSelection();
            }}
            onClick={() => {
              setActiveTableFromSelection();
              syncHeadingFromSelection();
            }}
            onKeyUp={() => {
              setActiveTableFromSelection();
              syncHeadingFromSelection();
            }}
            onInput={() => {
              onEditorInput();
              setActiveTableFromSelection();
              syncHeadingFromSelection();
            }}
            onBlur={() => {
              onEditorBlur();
              window.setTimeout(() => {
                if (!dragStateRef.current) {
                  setTableHandle((prev) => ({ ...prev, visible: false }));
                }
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
                title="Click: +1 column | Drag: add/remove columns"
                style={{
                  top: `${tableHandle.top + Math.max(12, tableHandle.height / 2) - 14}px`,
                  left: `${tableHandle.left + tableHandle.width - 10}px`,
                }}
                onMouseDown={(e) => startTableDrag("col", e)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addTableColumn();
                }}
              >
                +- Col
              </button>
              <button
                type="button"
                className="table-drag-handle table-drag-row"
                title="Click: +1 row | Drag: add/remove rows"
                style={{
                  top: `${tableHandle.top + tableHandle.height - 10}px`,
                  left: `${tableHandle.left + Math.max(12, tableHandle.width / 2) - 14}px`,
                }}
                onMouseDown={(e) => startTableDrag("row", e)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addTableRow();
                }}
              >
                +- Row
              </button>
            </>
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
