function isImage(node: Node | null): node is HTMLImageElement {
  return node instanceof HTMLImageElement;
}

function previousVisible(node: Node | null): Node | null {
  let current = node;
  while (current) {
    if (current.nodeType === Node.TEXT_NODE && !(current.textContent || "").replace(/\u200b/g, "").length) {
      current = current.previousSibling;
      continue;
    }
    return current;
  }
  return null;
}

function nextVisible(node: Node | null): Node | null {
  let current = node;
  while (current) {
    if (current.nodeType === Node.TEXT_NODE && !(current.textContent || "").replace(/\u200b/g, "").length) {
      current = current.nextSibling;
      continue;
    }
    return current;
  }
  return null;
}

function imageBeforeNode(node: Node): HTMLImageElement | null {
  let current: Node | null = node;
  while (current.parentNode) {
    const previous = previousVisible(current.previousSibling);
    if (isImage(previous)) return previous;
    if (previous) return null;
    const parent = current.parentNode;
    if (parent.nodeType !== Node.ELEMENT_NODE) return null;
    current = parent;
  }
  return null;
}

function imageAfterNode(node: Node): HTMLImageElement | null {
  let current: Node | null = node;
  while (current.parentNode) {
    const next = nextVisible(current.nextSibling);
    if (isImage(next)) return next;
    if (next) return null;
    const parent = current.parentNode;
    if (parent.nodeType !== Node.ELEMENT_NODE) return null;
    current = parent;
  }
  return null;
}

function imageBeforeCaret(range: Range): HTMLImageElement | null {
  const container = range.startContainer;
  const offset = range.startOffset;

  if (container.nodeType === Node.ELEMENT_NODE && offset > 0) {
    const previous = previousVisible(container.childNodes[offset - 1] ?? null);
    return isImage(previous) ? previous : null;
  }

  if (container.nodeType === Node.TEXT_NODE && offset > 0) return null;
  return imageBeforeNode(container);
}

function imageAfterCaret(range: Range): HTMLImageElement | null {
  const container = range.startContainer;
  const offset = range.startOffset;

  if (container.nodeType === Node.ELEMENT_NODE) {
    const next = nextVisible(container.childNodes[offset] ?? null);
    if (isImage(next)) return next;
    if (next) return null;
    return imageAfterNode(container);
  }

  if (container.nodeType === Node.TEXT_NODE) {
    const text = container.textContent || "";
    if (offset < text.length) return null;
    return imageAfterNode(container);
  }

  return imageAfterNode(container);
}

function imagesOnlyInRange(editor: HTMLElement, range: Range): HTMLImageElement[] | null {
  const images = [...editor.querySelectorAll("img")].filter((img) => range.intersectsNode(img));
  if (!images.length) return null;
  const text = (range.cloneContents().textContent || "").replace(/\u200b/g, "").trim();
  if (text) return null;
  return images;
}

function placeCaret(editor: HTMLElement, selection: Selection, node: Node | null) {
  const range = document.createRange();
  if (node && node.parentNode) {
    range.setStartBefore(node);
  } else {
    range.selectNodeContents(editor);
    range.collapse(false);
  }
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

/** Remove a selected article image, or the image touching the caret. */
export function removeEditorImageOnKey(editor: HTMLElement, key: "Backspace" | "Delete"): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return false;
  const anchor = selection.anchorNode;
  if (!anchor || !editor.contains(anchor)) return false;

  const range = selection.getRangeAt(0);
  if (!range.collapsed) {
    const images = imagesOnlyInRange(editor, range);
    if (!images) return false;
    const after = images[0]?.nextSibling ?? null;
    images.forEach((img) => img.remove());
    placeCaret(editor, selection, after);
    return true;
  }

  const image = key === "Backspace" ? imageBeforeCaret(range) : imageAfterCaret(range);
  if (!image || !editor.contains(image)) return false;
  const after = key === "Backspace" ? image.nextSibling : image;
  image.remove();
  placeCaret(editor, selection, key === "Backspace" ? after : image.previousSibling);
  return true;
}

export function selectEditorImage(editor: HTMLElement, image: HTMLImageElement) {
  if (!editor.contains(image)) return;
  editor.querySelectorAll("img.is-selected").forEach((node) => node.classList.remove("is-selected"));
  image.classList.add("is-selected");
  const range = document.createRange();
  range.selectNode(image);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}
