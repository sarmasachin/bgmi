"use client";

import { useCallback, useEffect, useState } from "react";
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

export function AdminEmailSubscribersPanel({ initialItems }: Props) {
  const setMessage = useAdminFlash();
  const [rows, setRows] = useState<SubscriberRow[]>(initialItems ?? []);
  const [loading, setLoading] = useState(initialItems === undefined);
  const [busyEmail, setBusyEmail] = useState<string | null>(null);

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
            createdAt: String(item.createdAt ?? "").slice(0, 10),
          }))
        : [];
      setRows(next);
    } catch {
      setMessage("Network error loading emails.");
    } finally {
      setLoading(false);
    }
  }, [setMessage]);

  useEffect(() => {
    if (initialItems === undefined) void load();
  }, [initialItems, load]);

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
      setRows((prev) => prev.filter((row) => row.email !== email));
      setMessage("Email removed from campaign list.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setBusyEmail(null);
    }
  }

  return (
    <div className="admin-notifications-card">
      <h2>Subscriber emails ({rows.length})</h2>
      <p style={{ margin: "0 0 12px", opacity: 0.8, fontSize: 13 }}>
        Emails collected for campaigns (rating, testimonial, contact, comments, footer subscribe).
        <strong> Remove</strong> keeps them off this list and email campaigns — even after refresh.
        They only return if the user subscribes again from the footer.
      </p>
      <div style={{ marginBottom: 10 }}>
        <button type="button" className="admin-pages-btn admin-pages-btn-preview" onClick={() => void load()}>
          Refresh emails
        </button>
      </div>
      <table className="admin-table admin-notifications-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Source tags</th>
            <th>Added</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4}>Loading emails…</td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={4}>No subscriber emails yet.</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id || row.email}>
                <td>
                  <a href={`mailto:${row.email}`} style={{ color: "inherit" }}>
                    {row.email}
                  </a>
                </td>
                <td>{row.tags.filter((t) => t !== "all").join(", ") || "site"}</td>
                <td>{row.createdAt || "-"}</td>
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
  );
}
