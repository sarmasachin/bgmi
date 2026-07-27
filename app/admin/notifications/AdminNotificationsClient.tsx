"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";
import {
  AdminEmailSubscribersPanel,
  type SubscriberRow,
} from "./AdminEmailSubscribersPanel";

type CampaignStatus = "queued" | "sent" | "failed" | "partial";
type Channel = "email" | "push";

type CampaignItem = {
  id: string;
  title: string;
  body: string;
  channel: Channel;
  segment: string;
  status: CampaignStatus;
  sentCount: number;
  failCount: number;
  errorNote: string | null;
  createdAt: string;
};

type Stats = { pushCount: number; emailCount: number };

function mapCampaign(raw: Record<string, unknown>): CampaignItem {
  const channel = raw.channel === "push" ? "push" : "email";
  const status =
    raw.status === "sent" ||
    raw.status === "failed" ||
    raw.status === "partial" ||
    raw.status === "queued"
      ? raw.status
      : "queued";
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? raw.campaign ?? ""),
    body: String(raw.body ?? ""),
    channel,
    segment: String(raw.segment ?? "all"),
    status,
    sentCount: Number(raw.sentCount ?? 0),
    failCount: Number(raw.failCount ?? 0),
    errorNote: raw.errorNote ? String(raw.errorNote) : null,
    createdAt: String(raw.createdAt ?? "").slice(0, 10),
  };
}

type Props = {
  initialItems?: CampaignItem[];
  initialStats?: Stats;
  initialSubscribers?: SubscriberRow[];
};

export default function AdminNotificationsClient({
  initialItems,
  initialStats,
  initialSubscribers,
}: Props) {
  const setMessage = useAdminFlash();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(initialItems === undefined);
  const [visibleCount, setVisibleCount] = useState(10);
  const [rows, setRows] = useState<CampaignItem[]>(initialItems ?? []);
  const [stats, setStats] = useState<Stats>(
    initialStats ?? { pushCount: 0, emailCount: 0 },
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications", { credentials: "include" });
      const json = (await res.json().catch(() => ({}))) as {
        data?: unknown[];
        stats?: Stats;
        error?: string;
      };
      if (!res.ok) {
        setMessage(json.error || "Could not load campaigns.");
        return;
      }
      const next = Array.isArray(json.data)
        ? json.data.map((item) => mapCampaign(item as Record<string, unknown>))
        : [];
      setRows(next);
      if (json.stats) setStats(json.stats);
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [setMessage]);

  useEffect(() => {
    if (initialItems === undefined) void load();
  }, [initialItems, load]);

  async function sendCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      title: String(formData.get("title") || "").trim(),
      body: String(formData.get("body") || "").trim(),
      channel: String(formData.get("channel") || "email"),
      segment: String(formData.get("segment") || "all").trim() || "all",
    };

    setBusy(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({}))) as {
        data?: Record<string, unknown>;
        warning?: string;
        error?: string;
        recipientCount?: number;
      };

      if (!res.ok && !json.data) {
        setMessage(json.error || (await readApiError(res, "Campaign failed.")));
        return;
      }

      if (json.data) {
        const row = mapCampaign(json.data);
        setRows((prev) => [row, ...prev.filter((r) => r.id !== row.id)]);
        setVisibleCount(10);
        form.reset();
        if (row.status === "sent") {
          setMessage(
            `Sent to ${row.sentCount} recipient${row.sentCount === 1 ? "" : "s"}.`,
          );
        } else if (row.status === "partial") {
          setMessage(
            `Partial: ${row.sentCount} sent, ${row.failCount} failed.${json.warning ? ` ${json.warning}` : ""}`,
          );
        } else {
          setMessage(json.warning || json.error || "Campaign failed — no recipients reached.");
        }
      }
      await load();
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  async function removeCampaign(id: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Delete failed."));
        return;
      }
      setRows((prev) => prev.filter((row) => row.id !== id));
      setMessage("Campaign deleted.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  const visible = useMemo(() => rows.slice(0, visibleCount), [rows, visibleCount]);

  return (
    <section className="admin-section admin-notifications-section">
      <div className="admin-notifications-head">
        <h1>Campaign Management</h1>
        <div className="admin-notifications-stats">
          <span>Push subscribers: {stats.pushCount}</span>
          <span>Email subscribers: {stats.emailCount}</span>
          <span>Campaigns: {rows.length}</span>
        </div>
      </div>

      <div className="admin-notifications-card">
        <h2>Send Campaign</h2>
        <p style={{ margin: "0 0 12px", opacity: 0.8, fontSize: 13 }}>
          Push goes to browsers that enabled notifications. Email goes to footer email subscribers.
          Segment: <code>all</code>, <code>pc</code>, <code>mobile</code>, <code>android</code>, or{" "}
          <code>ios</code>.
        </p>
        <form onSubmit={(e) => void sendCampaign(e)} className="admin-inline-form admin-notifications-form">
          <input name="title" placeholder="Campaign title" required minLength={2} />
          <input name="body" placeholder="Message body" required minLength={2} />
          <select name="channel" defaultValue="push" aria-label="Channel">
            <option value="push">Push (browser)</option>
            <option value="email">Email</option>
          </select>
          <input name="segment" placeholder="Segment (all / pc / mobile)" defaultValue="all" required />
          <button type="submit" disabled={busy}>
            {busy ? "Sending…" : "Send Campaign"}
          </button>
        </form>
      </div>

      <div className="admin-notifications-card">
        <h2>Campaign History</h2>
        <table className="admin-table admin-notifications-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Segment</th>
              <th>Channel</th>
              <th>Status</th>
              <th>Delivered</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>Loading campaigns…</td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={7}>No campaigns yet. Send one above.</td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.title}</strong>
                    {row.errorNote ? (
                      <div style={{ opacity: 0.75, fontSize: 12, marginTop: 4 }}>{row.errorNote}</div>
                    ) : null}
                  </td>
                  <td>{row.segment}</td>
                  <td>{row.channel}</td>
                  <td>
                    <span className={`admin-notifications-badge status-${row.status}`}>{row.status}</span>
                  </td>
                  <td>
                    {row.sentCount}
                    {row.failCount ? ` / fail ${row.failCount}` : ""}
                  </td>
                  <td>{row.createdAt || "-"}</td>
                  <td className="admin-notifications-actions">
                    <div className="admin-notifications-actions-wrap">
                      <button type="button" disabled={busy} onClick={() => void removeCampaign(row.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {rows.length > visibleCount ? (
          <div className="admin-notifications-load-more-wrap">
            <button
              type="button"
              className="admin-pages-btn admin-pages-btn-preview admin-notifications-load-more"
              onClick={() => setVisibleCount((n) => n + 10)}
            >
              Load more
            </button>
          </div>
        ) : null}
      </div>

      <AdminEmailSubscribersPanel initialItems={initialSubscribers} />
    </section>
  );
}
