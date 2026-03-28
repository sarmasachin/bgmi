"use client";

import { useEffect, useState } from "react";

type Health = {
  ok: boolean;
  env: {
    total: number;
    present: number;
    status: Array<{ key: string; present: boolean }>;
  };
};

export default function AdminSystemPage() {
  const [data, setData] = useState<Health | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    fetch("/api/admin/system/health", { cache: "no-store", credentials: "include" })
      .then(async (res) => {
        const json = (await res.json()) as Health;
        if (!res.ok) throw new Error("Bad response");
        setData(json);
      })
      .catch(() => {
        setData(null);
        setError("Could not load health data.");
      });
  }, []);

  return (
    <section className="admin-section">
      <h1>System Health</h1>
      <p className="admin-dashboard-subtitle">
        Shows which optional env vars are set (not a full DB/SMTP connectivity test).
      </p>
      {error ? <p className="admin-ratings-message">{error}</p> : null}
      {!data && !error ? (
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
