"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";

type CampaignStatus = "draft" | "queued" | "sent" | "failed";
type Channel = "email" | "push";

type CampaignItem = {
  id: string;
  campaign: string;
  segment: string;
  channel: Channel;
  status: CampaignStatus;
  createdAt: string;
};

const DEFAULT_CAMPAIGNS: CampaignItem[] = [
  { id: "c1", campaign: "Weekly Gaming Update", segment: "PC", channel: "email", status: "draft", createdAt: "2026-03-26" },
  { id: "c2", campaign: "Tournament Alert", segment: "All", channel: "push", status: "sent", createdAt: "2026-03-25" },
  { id: "c3", campaign: "Patch Notes", segment: "Mobile", channel: "email", status: "queued", createdAt: "2026-03-25" },
  { id: "c4", campaign: "Weekend Offer", segment: "All", channel: "push", status: "sent", createdAt: "2026-03-24" },
  { id: "c5", campaign: "New Sens Presets", segment: "Android", channel: "email", status: "queued", createdAt: "2026-03-24" },
  { id: "c6", campaign: "News Digest", segment: "iOS", channel: "email", status: "draft", createdAt: "2026-03-23" },
  { id: "c7", campaign: "Maintenance Notice", segment: "All", channel: "push", status: "sent", createdAt: "2026-03-22" },
  { id: "c8", campaign: "Creator Spotlight", segment: "All", channel: "email", status: "sent", createdAt: "2026-03-22" },
  { id: "c9", campaign: "Feature Rollout", segment: "PC", channel: "push", status: "queued", createdAt: "2026-03-21" },
  { id: "c10", campaign: "Event Reminder", segment: "All", channel: "email", status: "sent", createdAt: "2026-03-20" },
  { id: "c11", campaign: "Night Mode Tips", segment: "Mobile", channel: "email", status: "draft", createdAt: "2026-03-20" },
  { id: "c12", campaign: "Leaderboard Update", segment: "All", channel: "push", status: "sent", createdAt: "2026-03-19" },
];

export default function AdminNotificationsClient() {
  const setMessage = useAdminFlash();
  const [busy, setBusy] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [rows, setRows] = useState<CampaignItem[]>(DEFAULT_CAMPAIGNS);

  async function sendCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get("title") || ""),
      body: String(formData.get("body") || ""),
      channel: String(formData.get("channel") || "email"),
      segment: String(formData.get("segment") || "all"),
    };

    setBusy(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const nextStatus: CampaignStatus = res.ok ? "queued" : "failed";
      setMessage(res.ok ? "Campaign queued." : await readApiError(res, "Campaign failed."));
      if (res.ok) {
        setRows((prev) => [
          {
            id: `new-${Date.now()}`,
            campaign: payload.title,
            segment: payload.segment,
            channel: payload.channel === "push" ? "push" : "email",
            status: nextStatus,
            createdAt: new Date().toISOString().slice(0, 10),
          },
          ...prev,
        ]);
        event.currentTarget.reset();
        setVisibleCount(10);
      } else {
        setRows((prev) => [
          {
            id: `new-${Date.now()}`,
            campaign: payload.title,
            segment: payload.segment,
            channel: payload.channel === "push" ? "push" : "email",
            status: "failed",
            createdAt: new Date().toISOString().slice(0, 10),
          },
          ...prev,
        ]);
      }
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  const stats = useMemo(() => {
    return {
      total: rows.length,
      queued: rows.filter((item) => item.status === "queued").length,
      sent: rows.filter((item) => item.status === "sent").length,
      failed: rows.filter((item) => item.status === "failed").length,
    };
  }, [rows]);

  const visibleRows = useMemo(() => rows.slice(0, visibleCount), [rows, visibleCount]);
  const hasMore = visibleCount < rows.length;

  function deleteCampaign(id: string) {
    setRows((prev) => prev.filter((item) => item.id !== id));
    setMessage("Campaign deleted.");
  }

  return (
    <section className="admin-section admin-notifications-section">
      <div className="admin-notifications-head">
        <h1>Notifications</h1>
        <div className="admin-notifications-stats">
          <span>Total: {stats.total}</span>
          <span>Queued: {stats.queued}</span>
          <span>Sent: {stats.sent}</span>
          <span>Failed: {stats.failed}</span>
        </div>
      </div>

      <div className="admin-notifications-card">
        <h2>Send Campaign</h2>
        <form onSubmit={sendCampaign} className="admin-inline-form admin-notifications-form">
          <input name="title" placeholder="Campaign title" required minLength={2} />
          <input name="body" placeholder="Message body" required minLength={2} />
          <select name="channel" defaultValue="email">
            <option value="email">Email</option>
            <option value="push">Push</option>
          </select>
          <input name="segment" placeholder="Segment tag (e.g. PC)" required minLength={1} />
          <button type="submit" disabled={busy}>
            {busy ? "Queueing..." : "Queue Campaign"}
          </button>
        </form>
      </div>

      <div className="admin-notifications-card">
        <h2>Campaign History</h2>
        <div className="admin-table-wrap">
          <table className="admin-table admin-notifications-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Segment</th>
                <th>Channel</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.campaign}</td>
                  <td>{row.segment}</td>
                  <td>{row.channel}</td>
                  <td>
                    <span className={`admin-notifications-badge status-${row.status}`}>{row.status}</span>
                  </td>
                  <td>{row.createdAt}</td>
                  <td className="admin-notifications-actions">
                    <div className="admin-notifications-actions-wrap">
                      <button type="button" className="admin-pages-btn admin-pages-btn-delete" onClick={() => deleteCampaign(row.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasMore ? (
          <div className="admin-notifications-load-more-wrap">
            <button
              type="button"
              className="admin-pages-btn admin-pages-btn-preview admin-notifications-load-more"
              onClick={() => setVisibleCount((prev) => prev + 10)}
            >
              Load More
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
