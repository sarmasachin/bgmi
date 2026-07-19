"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdminAuditRow } from "@/src/server/repositories/adminAuditRepository";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import {
  formatAuditActor,
  formatAuditDetails,
  formatAuditWhatHappened,
} from "@/src/lib/formatAuditLog";

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
  }, [setMessage]);

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
        Simple history of admin actions — who did what, and when. Showing the latest 100 entries.
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
                <th>Who</th>
                <th>What happened</th>
                <th>Details</th>
                <th>When</th>
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
                    <td>{formatAuditActor(row.actor)}</td>
                    <td>{formatAuditWhatHappened(row.action, row.payload)}</td>
                    <td>{formatAuditDetails(row.action, row.target, row.payload)}</td>
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
