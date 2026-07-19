"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminAuditRow } from "@/src/server/repositories/adminAuditRepository";
import { useAdminFlash } from "@/src/components/admin/AdminToast";

type Row = AdminAuditRow;

type Props = {
  initialRows?: Row[];
};

export default function AdminAuditClient({ initialRows }: Props) {
  const [rows, setRows] = useState<Row[]>(initialRows ?? []);
  const setMessage = useAdminFlash();
  const [loading, setLoading] = useState(initialRows === undefined);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/audit", { cache: "no-store", credentials: "include" });
      const json = (await res.json()) as { data?: Row[] };
      if (!res.ok) {
        setMessage("Could not load audit logs.");
        setRows([]);
        return;
      }
      setRows(json.data ?? []);
    } catch {
      setMessage("Network error loading logs.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialRows !== undefined) return;
    void load();
  }, [initialRows, load]);

  async function clearAll() {
    if (
      !confirm(
        "Remove every audit log entry from the database? This cannot be undone.",
      )
    ) {
      return;
    }
    setClearing(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/audit", { method: "DELETE", credentials: "include" });
      const json = (await res.json()) as { ok?: boolean; deleted?: number; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Could not clear logs.");
        return;
      }
      setMessage(`Cleared ${json.deleted ?? 0} log entries.`);
      setRows([]);
    } catch {
      setMessage("Network error while clearing logs.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <section className="admin-section">
      <h1>Audit logs</h1>
      <p className="admin-dashboard-subtitle">
        Last 100 entries from the database. With no database connection, this list stays empty.
      </p>
      <div className="admin-actions">
        <button
          type="button"
          className="admin-pages-btn admin-pages-btn-delete"
          disabled={loading || clearing || rows.length === 0}
          onClick={() => void clearAll()}
        >
          {clearing ? "Clearing…" : "Clear all logs"}
        </button>
        <button
          type="button"
          className="admin-pages-btn admin-pages-btn-preview"
          disabled={loading || clearing}
          onClick={() => void load()}
        >
          Refresh
        </button>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4}>No logs yet.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.actor}</td>
                    <td>{row.action}</td>
                    <td>{row.target}</td>
                    <td>{new Date(row.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
