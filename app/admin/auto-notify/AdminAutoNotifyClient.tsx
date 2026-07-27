"use client";

import { useState } from "react";
import { readApiError } from "@/src/lib/userFacingError";

export type AutoNotifySettings = {
  newsOnPublish: boolean;
  pagesOnPublish: boolean;
};

export default function AdminAutoNotifyClient({
  initialSettings,
}: {
  initialSettings: AutoNotifySettings;
}) {
  const [newsOnPublish, setNewsOnPublish] = useState(initialSettings.newsOnPublish);
  const [pagesOnPublish, setPagesOnPublish] = useState(initialSettings.pagesOnPublish);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save(next: AutoNotifySettings) {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/auto-notify", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(next),
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: AutoNotifySettings;
        error?: string;
      };
      if (!res.ok || !json.data) {
        setMessage(json.error || (await readApiError(res, "Save failed.")));
        return;
      }
      setNewsOnPublish(json.data.newsOnPublish);
      setPagesOnPublish(json.data.pagesOnPublish);
      setMessage("Auto Notify settings saved.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-section admin-notifications-section">
      <div className="admin-notifications-head">
        <h1>Auto Notify</h1>
      </div>

      <div className="admin-notifications-card">
        <h2>Publish push notifications</h2>
        <p style={{ margin: "0 0 16px", opacity: 0.8, fontSize: 13 }}>
          Jab checkbox ON ho, publish pe subscribers ko automatic push jayegi. Manual campaigns ke
          liye <strong>Notifications</strong> menu use karo.
        </p>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
            fontSize: 15,
            cursor: busy ? "default" : "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={newsOnPublish}
            disabled={busy}
            onChange={(e) => {
              const next = { newsOnPublish: e.target.checked, pagesOnPublish };
              setNewsOnPublish(next.newsOnPublish);
              void save(next);
            }}
          />
          News publish pe auto push bhejo
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
            fontSize: 15,
            cursor: busy ? "default" : "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={pagesOnPublish}
            disabled={busy}
            onChange={(e) => {
              const next = { newsOnPublish, pagesOnPublish: e.target.checked };
              setPagesOnPublish(next.pagesOnPublish);
              void save(next);
            }}
          />
          Pages publish pe auto push bhejo
        </label>

        {message ? (
          <p style={{ marginTop: 16, fontSize: 13, opacity: 0.9 }} role="status">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
