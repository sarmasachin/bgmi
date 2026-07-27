"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";

export type SubscriberRow = {
  id: string;
  email: string;
  tags: string[];
  createdAt: string;
};

type Props = {
  initialItems?: SubscriberRow[];
};

const PAGE_SIZE = 10;

const SOURCE_LABELS: Record<string, string> = {
  "email-subscribe": "Email Subscribe",
  footer: "Email Subscribe",
  feedback: "Feedback",
  report: "Report Issue",
  contact: "Contact",
  testimonial: "Testimonial",
  rating: "Rating",
  comment: "Comment",
  site: "Site",
};

const DEVICE_LABELS: Record<string, string> = {
  mobile: "Mobile",
  pc: "PC",
  android: "Android",
  ios: "iOS",
};

/** Show clear source names in admin (not raw tag codes). */
function formatSubscriberSources(tags: string[]): string {
  const cleaned = tags.map((t) => t.trim().toLowerCase()).filter((t) => t && t !== "all");
  const sources = cleaned
    .map((t) => SOURCE_LABELS[t])
    .filter((label): label is string => Boolean(label));
  const devices = cleaned
    .map((t) => DEVICE_LABELS[t])
    .filter((label): label is string => Boolean(label));

  const uniqueSources = Array.from(new Set(sources));
  const uniqueDevices = Array.from(new Set(devices));

  if (uniqueSources.length === 0 && uniqueDevices.length > 0) {
    return `Email Subscribe (${uniqueDevices.join(", ")})`;
  }
  if (uniqueSources.length === 0) return "Site";
  if (uniqueDevices.length === 0) return uniqueSources.join(", ");
  return `${uniqueSources.join(", ")} · ${uniqueDevices.join(", ")}`;
}

function formatAddedDate(value: string): string {
  const raw = (value || "").trim();
  if (!raw) return "—";
  const d = new Date(raw.length <= 10 ? `${raw}T00:00:00Z` : raw);
  if (Number.isNaN(d.getTime())) return raw.slice(0, 10);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Compact page window: 1 … 4 5 6 … 12 */
function buildPageItems(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const set = new Set<number>([1, total, current]);
  for (let d = 1; d <= 1; d += 1) {
    if (current - d >= 1) set.add(current - d);
    if (current + d <= total) set.add(current + d);
  }
  if (current <= 3) {
    set.add(2);
    set.add(3);
    set.add(4);
  }
  if (current >= total - 2) {
    set.add(total - 1);
    set.add(total - 2);
    set.add(total - 3);
  }

  const sorted = Array.from(set)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];
  for (let i = 0; i < sorted.length; i += 1) {
    const page = sorted[i]!;
    if (i > 0 && page - sorted[i - 1]! > 1) items.push("ellipsis");
    items.push(page);
  }
  return items;
}

export function AdminEmailSubscribersPanel({ initialItems }: Props) {
  const setMessage = useAdminFlash();
  const [rows, setRows] = useState<SubscriberRow[]>(initialItems ?? []);
  const [loading, setLoading] = useState(initialItems === undefined);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);
  const [listPage, setListPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(listPage, totalPages);
  const pageStart = rows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(safePage * PAGE_SIZE, rows.length);
  const visible = useMemo(
    () => rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [rows, safePage],
  );
  const pageItems = useMemo(() => buildPageItems(safePage, totalPages), [safePage, totalPages]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications/subscribers", {
        credentials: "include",
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: Array<Record<string, unknown>>;
        error?: string;
      };
      if (!res.ok) {
        setMessage(json.error || "Could not load subscriber emails.");
        return;
      }
      const next = Array.isArray(json.data)
        ? json.data.map((item) => ({
            id: String(item.id ?? ""),
            email: String(item.email ?? ""),
            tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
            createdAt: String(item.createdAt ?? ""),
          }))
        : [];
      setRows(next);
      setListPage(1);
    } catch {
      setMessage("Network error loading emails.");
    } finally {
      setLoading(false);
    }
  }, [setMessage]);

  useEffect(() => {
    if (initialItems === undefined) void load();
  }, [initialItems, load]);

  useEffect(() => {
    if (listPage > totalPages) setListPage(totalPages);
  }, [listPage, totalPages]);

  async function removeEmail(email: string) {
    setBusyEmail(email);
    try {
      const res = await fetch(
        `/api/admin/notifications/subscribers?email=${encodeURIComponent(email)}`,
        { method: "DELETE", credentials: "include" },
      );
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not remove email."));
        return;
      }
      setRows((prev) => {
        const next = prev.filter((row) => row.email !== email);
        const nextTotal = Math.max(1, Math.ceil(next.length / PAGE_SIZE));
        setListPage((p) => Math.min(p, nextTotal));
        return next;
      });
      setMessage("Email removed from campaign list.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setBusyEmail(null);
    }
  }

  return (
    <div className="admin-notifications-card admin-subscribers-card">
      <div className="admin-subscribers-head">
        <div>
          <h2>Subscriber emails</h2>
          <p className="admin-subscribers-sub">
            Campaign list from footer subscribe, contact, feedback, report, ratings, and more.
            Remove keeps them off email campaigns until they subscribe again.
          </p>
        </div>
        <div className="admin-subscribers-head-actions">
          <span className="admin-subscribers-count">{rows.length} active</span>
          <button
            type="button"
            className="admin-pages-btn admin-pages-btn-preview"
            onClick={() => void load()}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="admin-subscribers-table-wrap">
        <table className="admin-table admin-notifications-table admin-subscribers-table">
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col">Source</th>
              <th scope="col">Added</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>Loading emails…</td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={4}>No subscriber emails yet.</td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.id || row.email}>
                  <td>
                    <a href={`mailto:${row.email}`} className="admin-subscribers-email">
                      {row.email}
                    </a>
                  </td>
                  <td>
                    <span className="admin-subscribers-source">{formatSubscriberSources(row.tags)}</span>
                  </td>
                  <td>{formatAddedDate(row.createdAt)}</td>
                  <td className="admin-notifications-actions">
                    <button
                      type="button"
                      disabled={busyEmail === row.email}
                      onClick={() => void removeEmail(row.email)}
                    >
                      {busyEmail === row.email ? "Removing…" : "Remove"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && rows.length > 0 ? (
        <div className="admin-subscribers-pager" aria-label="Subscriber email pagination">
          <p className="admin-subscribers-pager-meta">
            Showing <strong>{pageStart}</strong>–<strong>{pageEnd}</strong> of{" "}
            <strong>{rows.length}</strong>
          </p>
          <div className="admin-subscribers-pager-controls">
            <button
              type="button"
              className="admin-subscribers-pager-btn"
              disabled={safePage <= 1}
              onClick={() => setListPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              Prev
            </button>
            <div className="admin-subscribers-pager-pages" role="navigation" aria-label="Pages">
              {pageItems.map((item, index) =>
                item === "ellipsis" ? (
                  <span key={`e-${index}`} className="admin-subscribers-pager-ellipsis" aria-hidden>
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    className={`admin-subscribers-pager-num${item === safePage ? " is-active" : ""}`}
                    aria-current={item === safePage ? "page" : undefined}
                    onClick={() => setListPage(item)}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
            <button
              type="button"
              className="admin-subscribers-pager-btn"
              disabled={safePage >= totalPages}
              onClick={() => setListPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
