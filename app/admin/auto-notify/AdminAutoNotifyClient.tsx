"use client";

import { FormEvent, useState } from "react";
import { readApiError } from "@/src/lib/userFacingError";

export type AutoNotifySettings = {
  newsOnPublish: boolean;
  pagesOnPublish: boolean;
};

export type EmailCampaignQuota = {
  dailySendLimit: number;
  sentToday: number;
  remainingToday: number;
};

export default function AdminAutoNotifyClient({
  initialSettings,
  initialEmailQuota,
}: {
  initialSettings: AutoNotifySettings;
  initialEmailQuota: EmailCampaignQuota;
}) {
  const [newsOnPublish, setNewsOnPublish] = useState(initialSettings.newsOnPublish);
  const [pagesOnPublish, setPagesOnPublish] = useState(initialSettings.pagesOnPublish);
  const [dailySendLimit, setDailySendLimit] = useState(initialEmailQuota.dailySendLimit);
  const [sentToday, setSentToday] = useState(initialEmailQuota.sentToday);
  const [remainingToday, setRemainingToday] = useState(initialEmailQuota.remainingToday);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function savePush(next: AutoNotifySettings) {
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

  async function saveEmailLimit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/email-campaign-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dailySendLimit }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: EmailCampaignQuota;
        error?: string;
      };
      if (!res.ok || !json.data) {
        setMessage(json.error || (await readApiError(res, "Save failed.")));
        return;
      }
      setDailySendLimit(json.data.dailySendLimit);
      setSentToday(json.data.sentToday);
      setRemainingToday(json.data.remainingToday);
      setMessage("Email daily limit saved.");
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
          When enabled, publishing News/Pages sends a push automatically. Manual campaigns stay under{" "}
          <strong>Notifications</strong>.
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
              void savePush(next);
            }}
          />
          Auto push on News publish
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
              void savePush(next);
            }}
          />
          Auto push on Pages publish
        </label>
      </div>

      <div className="admin-notifications-card">
        <h2>Email campaign daily limit</h2>
        <p style={{ margin: "0 0 14px", opacity: 0.8, fontSize: 13 }}>
          Example: 1000 subscribers + limit <strong>950</strong> → day 1 sends ~950 unique users, day 2
          continues with the remaining (no duplicate to the same user in one campaign). Quota resets
          each UTC day.
        </p>
        <p style={{ margin: "0 0 14px", opacity: 0.8, fontSize: 13 }}>
          Send pace (auto): daily limit ÷ 1440 min → at <strong>{dailySendLimit}</strong>/day ≈{" "}
          <strong>{(dailySendLimit / 1440).toFixed(2)}</strong>/min (~1 email every{" "}
          <strong>{Math.round(86400 / Math.max(1, dailySendLimit))}</strong>s) so mail stays under
          spam burst limits.
        </p>
        <p style={{ margin: "0 0 14px", fontSize: 13 }}>
          Today: <strong>{sentToday}</strong> sent · <strong>{remainingToday}</strong> remaining ·
          limit <strong>{dailySendLimit}</strong>/day
        </p>
        <form
          onSubmit={(e) => void saveEmailLimit(e)}
          className="admin-inline-form"
          style={{ gridTemplateColumns: "minmax(160px, 220px) auto", alignItems: "end" }}
        >
          <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
            Daily send limit
            <input
              type="number"
              min={1}
              max={5000}
              value={dailySendLimit}
              disabled={busy}
              onChange={(e) => setDailySendLimit(Number(e.target.value) || 1)}
              aria-label="Email daily send limit"
            />
          </label>
          <button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save limit"}
          </button>
        </form>
      </div>

      {message ? (
        <p style={{ margin: 0, fontSize: 13, opacity: 0.9 }} role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
