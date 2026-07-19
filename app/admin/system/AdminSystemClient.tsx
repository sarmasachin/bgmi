"use client";

import { useEffect, useState } from "react";
import type { SystemHealthData } from "@/src/server/admin/getSystemHealthData";
import { useAdminFlash } from "@/src/components/admin/AdminToast";

type Health = SystemHealthData;

type Props = {
  initialData?: Health;
};

export default function AdminSystemClient({ initialData }: Props) {
  const [data, setData] = useState<Health | null>(initialData ?? null);
  const [loading, setLoading] = useState(initialData === undefined);
  const flash = useAdminFlash();

  useEffect(() => {
    if (initialData !== undefined) return;
    setLoading(true);
    fetch("/api/admin/system/health", { cache: "no-store", credentials: "include" })
      .then(async (res) => {
        const json = (await res.json()) as Health;
        if (!res.ok) throw new Error("Bad response");
        setData(json);
      })
      .catch(() => {
        setData(null);
        flash("Could not load health data.");
      })
      .finally(() => setLoading(false));
  }, [initialData, flash]);

  return (
    <section className="admin-section">
      <h1>System Health</h1>
      <p className="admin-dashboard-subtitle">
        Shows which optional env vars are set (not a full DB/SMTP connectivity test).
      </p>
      {loading ? (
        <p>Loading…</p>
      ) : data ? (
        <>
          <p>
            Env readiness: {data.env.present}/{data.env.total}
          </p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.env.status.map((entry) => (
                  <tr key={entry.key}>
                    <td>{entry.key}</td>
                    <td>{entry.present ? "Configured" : "Missing"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
