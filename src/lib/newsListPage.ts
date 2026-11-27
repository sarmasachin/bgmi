/** Page query for news listings. Non-numbers and fractions become a whole page. */
export function parseNewsListPage(raw?: string | number | null): number {
  const value = typeof raw === "number" ? raw : Number(raw ?? "1");
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.trunc(value));
}

export function newsListTotalPages(total: number, pageSize: number): number {
  const safeSize = Math.max(1, Math.trunc(pageSize));
  return Math.max(1, Math.ceil(Math.max(0, total) / safeSize));
}

/** Last real page when the query is past the published count. */
export function clampNewsListPage(requested: number, total: number, pageSize: number): number {
  return Math.min(parseNewsListPage(requested), newsListTotalPages(total, pageSize));
}

/** Page 1 stays on the clean path. Later pages use `?page=`. */
export function newsListPagePath(basePath: string, page: number): string {
  const safe = parseNewsListPage(page);
  return safe > 1 ? `${basePath}?page=${safe}` : basePath;
}

/** How many page-number slots fit on one row at this width. */
export function newsPageSlotCount(width: number): number {
  if (!Number.isFinite(width) || width < 280) return 5;
  const reserved = 140;
  const slot = width < 640 ? 34 : 30;
  return Math.max(5, Math.min(40, Math.floor((width - reserved) / slot)));
}

function pageRange(start: number, end: number): number[] {
  const out: number[] = [];
  for (let n = start; n <= end; n += 1) out.push(n);
  return out;
}

/**
 * Page numbers for one row. Shows every page when they fit.
 * Otherwise a window around the current page, with the first and last page kept.
 */
export function visibleNewsPages(
  current: number,
  total: number,
  slots: number,
): Array<number | "gap"> {
  const count = Math.max(1, Math.trunc(total) || 1);
  const page = Math.min(Math.max(1, Math.trunc(current) || 1), count);
  const room = Math.max(1, Math.trunc(slots) || 1);
  if (count <= room) return pageRange(1, count);

  const withEdges = (middle: number[]) => {
    const out: Array<number | "gap"> = [];
    const firstMiddle = middle[0] ?? page;
    const lastMiddle = middle[middle.length - 1] ?? page;
    if (firstMiddle > 1) {
      out.push(1);
      if (firstMiddle > 2) out.push("gap");
    }
    for (const n of middle) {
      if (out[out.length - 1] !== n) out.push(n);
    }
    if (lastMiddle < count) {
      if (lastMiddle < count - 1) out.push("gap");
      if (out[out.length - 1] !== count) out.push(count);
    }
    return out;
  };

  let size = Math.min(count, room);
  while (size >= 1) {
    let start = page - Math.floor((size - 1) / 2);
    let end = start + size - 1;
    if (start < 1) {
      start = 1;
      end = size;
    }
    if (end > count) {
      end = count;
      start = count - size + 1;
    }
    const items = withEdges(pageRange(start, end));
    if (items.length <= room) return items;
    size -= 1;
  }
  return [page];
}
