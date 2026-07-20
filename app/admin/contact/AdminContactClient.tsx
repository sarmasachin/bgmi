"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { AdminContactItem } from "@/src/server/admin/mapAdminContactMessages";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";

type Props = {
  initialItems?: AdminContactItem[];
};

function formatWhen(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function AdminContactClient({ initialItems }: Props) {
  const [items, setItems] = useState<AdminContactItem[]>(initialItems ?? []);
  const [loading, setLoading] = useState(initialItems === undefined);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | AdminContactItem["status"]>("all");
  const setMessage = useAdminFlash();

  const counts = useMemo(
    () => ({
      all: items.length,
      new: items.filter((item) => item.status === "new").length,
      read: items.filter((item) => item.status === "read").length,
      archived: items.filter((item) => item.status === "archived").length,
    }),
    [items],
  );

  const visibleItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.status === filter);
  }, [items, filter]);

  async function loadMessages() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contact", { cache: "no-store", credentials: "include" });
      if (!res.ok) {
        setMessage("Failed to load contact messages.");
        setItems([]);
        return;
      }
      const json = (await res.json()) as { data?: Array<Record<string, unknown>> };
      setItems(
        (json.data ?? []).map((item) => ({
          id: String(item.id ?? ""),
          name: String(item.name ?? ""),
          email: String(item.email ?? ""),
          subject: String(item.subject ?? ""),
          message: String(item.message ?? ""),
          status:
            item.status === "read" || item.status === "archived" || item.status === "new"
              ? item.status
              : "new",
          createdAt: item.createdAt ? String(item.createdAt) : "",
        })),
      );
    } catch {
      setMessage("Network error. Please retry.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialItems !== undefined) return;
    void loadMessages();
  }, [initialItems]);

  async function updateStatus(id: string, status: AdminContactItem["status"]) {
    setWorkingId(id);
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      setMessage(res.ok ? `Marked as ${status}.` : await readApiError(res, "Update failed."));
      if (res.ok) await loadMessages();
    } catch {
      setMessage("Network error. Please retry.");
    }
    setWorkingId(null);
  }

  async function removeMessage(id: string) {
    if (!window.confirm("Delete this contact message?")) return;
    setWorkingId(id);
    try {
      const res = await fetch(`/api/admin/contact?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      setMessage(res.ok ? "Message deleted." : await readApiError(res, "Delete failed."));
      if (res.ok) {
        if (expandedId === id) setExpandedId(null);
        await loadMessages();
      }
    } catch {
      setMessage("Network error. Please retry.");
    }
    setWorkingId(null);
  }

  return (
    <section className="admin-section admin-comments-section">
      <div className="admin-comments-head">
        <h1>Contact Messages</h1>
        <div className="admin-comments-stats">
          <span>All: {counts.all}</span>
          <span>New: {counts.new}</span>
          <span>Read: {counts.read}</span>
          <span>Archived: {counts.archived}</span>
        </div>
      </div>

      <div className="admin-news-actions-wrap" style={{ marginBottom: 12, gap: 8 }}>
        {(["all", "new", "read", "archived"] as const).map((key) => (
          <button
            key={key}
            type="button"
            className={`admin-news-btn ${filter === key ? "admin-news-btn-primary" : "admin-news-btn-edit"}`}
            onClick={() => setFilter(key)}
          >
            {key === "all" ? "All" : key[0]!.toUpperCase() + key.slice(1)}
          </button>
        ))}
        <button type="button" className="admin-news-btn admin-news-btn-edit" onClick={() => void loadMessages()}>
          Refresh
        </button>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table admin-comments-table">
          <thead>
            <tr>
              <th>From</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Received</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Loading…</td>
              </tr>
            ) : visibleItems.length === 0 ? (
              <tr>
                <td colSpan={5}>No contact messages yet.</td>
              </tr>
            ) : (
              visibleItems.map((item) => {
                const open = expandedId === item.id;
                const busy = workingId === item.id;
                return (
                  <Fragment key={item.id}>
                    <tr>
                      <td>
                        <div style={{ fontWeight: 700 }}>{item.name}</div>
                        <a href={`mailto:${item.email}`} style={{ color: "inherit", opacity: 0.85 }}>
                          {item.email}
                        </a>
                      </td>
                      <td>{item.subject}</td>
                      <td>{item.status}</td>
                      <td>{formatWhen(item.createdAt)}</td>
                      <td className="admin-news-actions">
                        <div className="admin-news-actions-wrap">
                          <button
                            type="button"
                            className="admin-news-btn admin-news-btn-edit"
                            disabled={busy}
                            onClick={() => {
                              setExpandedId(open ? null : item.id);
                              if (!open && item.status === "new") {
                                void updateStatus(item.id, "read");
                              }
                            }}
                          >
                            {open ? "Hide" : "View"}
                          </button>
                          {item.status !== "archived" ? (
                            <button
                              type="button"
                              className="admin-news-btn admin-news-btn-edit"
                              disabled={busy}
                              onClick={() => void updateStatus(item.id, "archived")}
                            >
                              Archive
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="admin-news-btn admin-news-btn-edit"
                              disabled={busy}
                              onClick={() => void updateStatus(item.id, "read")}
                            >
                              Unarchive
                            </button>
                          )}
                          <button
                            type="button"
                            className="admin-news-btn admin-news-btn-danger"
                            disabled={busy}
                            onClick={() => void removeMessage(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    {open ? (
                      <tr>
                        <td colSpan={5}>
                          <div
                            style={{
                              whiteSpace: "pre-wrap",
                              lineHeight: 1.55,
                              padding: "8px 4px 12px",
                              color: "#cbd5e1",
                            }}
                          >
                            {item.message}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })
            )}          </tbody>
        </table>
      </div>
    </section>
  );
}
