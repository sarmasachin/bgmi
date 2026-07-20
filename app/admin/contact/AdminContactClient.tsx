"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { AdminContactItem } from "@/src/server/admin/mapAdminContactMessages";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";

type Props = {
  initialItems?: AdminContactItem[];
};

type StatusFilter = "all" | AdminContactItem["status"];

const STATUS_OPTIONS: Array<{ value: AdminContactItem["status"]; label: string }> = [
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "in_progress", label: "In Progress" },
  { value: "solved", label: "Solved" },
  { value: "archived", label: "Archived" },
];

function formatWhen(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function statusLabel(status: AdminContactItem["status"]) {
  return STATUS_OPTIONS.find((opt) => opt.value === status)?.label ?? status;
}

function topicLabel(topic: AdminContactItem["topic"]) {
  if (topic === "report") return "Report";
  if (topic === "feedback") return "Feedback";
  return "Contact";
}

function mapLoadedItem(item: Record<string, unknown>): AdminContactItem {
  const status =
    item.status === "read" ||
    item.status === "archived" ||
    item.status === "new" ||
    item.status === "in_progress" ||
    item.status === "solved"
      ? item.status
      : "new";
  const topicRaw = String(item.topic ?? "").toLowerCase();
  const subject = String(item.subject ?? "");
  const topic: AdminContactItem["topic"] =
    topicRaw === "report" || topicRaw === "issue"
      ? "report"
      : topicRaw === "feedback"
        ? "feedback"
        : /report|issue/i.test(subject)
          ? "report"
          : /feedback/i.test(subject)
            ? "feedback"
            : "general";
  const eta =
    item.etaHours === 24 || item.etaHours === "24"
      ? 24
      : item.etaHours === 48 || item.etaHours === "48"
        ? 48
        : null;

  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    email: String(item.email ?? ""),
    subject,
    message: String(item.message ?? ""),
    topic,
    status,
    etaHours: eta,
    createdAt: item.createdAt ? String(item.createdAt) : "",
  };
}

export default function AdminContactClient({ initialItems }: Props) {
  const [items, setItems] = useState<AdminContactItem[]>(initialItems ?? []);
  const [loading, setLoading] = useState(initialItems === undefined);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [etaDraft, setEtaDraft] = useState<Record<string, 24 | 48>>({});
  const setMessage = useAdminFlash();

  const counts = useMemo(
    () => ({
      all: items.length,
      new: items.filter((item) => item.status === "new").length,
      read: items.filter((item) => item.status === "read").length,
      in_progress: items.filter((item) => item.status === "in_progress").length,
      solved: items.filter((item) => item.status === "solved").length,
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
      setItems((json.data ?? []).map(mapLoadedItem));
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

  async function updateStatus(
    id: string,
    status: AdminContactItem["status"],
    etaHours?: 24 | 48,
  ) {
    setWorkingId(id);
    try {
      const body: { id: string; status: AdminContactItem["status"]; etaHours?: 24 | 48 } = {
        id,
        status,
      };
      if (status === "in_progress") body.etaHours = etaHours ?? 24;

      const res = await fetch("/api/admin/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const json = (await res.json().catch(() => ({}))) as {
        emailSent?: boolean;
        emailWarning?: string;
        error?: string;
      };

      if (!res.ok) {
        setMessage(json.error || "Update failed.");
      } else if (status === "in_progress") {
        setMessage(
          json.emailSent
            ? `Marked In Progress (${body.etaHours}h). User notified by email.`
            : `Marked In Progress (${body.etaHours}h). Email could not be sent.`,
        );
      } else if (status === "solved") {
        setMessage(
          json.emailSent
            ? "Marked Solved. User notified by email."
            : "Marked Solved. Email could not be sent.",
        );
      } else {
        setMessage(`Marked as ${statusLabel(status)}.`);
      }
      if (res.ok) await loadMessages();
    } catch {
      setMessage("Network error. Please retry.");
    }
    setWorkingId(null);
  }

  async function onStatusChange(item: AdminContactItem, next: AdminContactItem["status"]) {
    if (next === item.status) return;

    if (next === "in_progress") {
      const hours = etaDraft[item.id] ?? item.etaHours ?? 24;
      const ok = window.confirm(
        `Mark as In Progress and email the user that the issue will be resolved within ${hours} hours?`,
      );
      if (!ok) return;
      await updateStatus(item.id, "in_progress", hours);
      return;
    }

    if (next === "solved") {
      const ok = window.confirm(
        "Mark as Solved and email the user that the problem has been resolved?",
      );
      if (!ok) return;
      await updateStatus(item.id, "solved");
      return;
    }

    await updateStatus(item.id, next);
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

  const filterKeys: StatusFilter[] = [
    "all",
    "new",
    "read",
    "in_progress",
    "solved",
    "archived",
  ];

  return (
    <section className="admin-section admin-comments-section">
      <div className="admin-comments-head">
        <h1>Contact Messages</h1>
        <div className="admin-comments-stats">
          <span>All: {counts.all}</span>
          <span>New: {counts.new}</span>
          <span>In Progress: {counts.in_progress}</span>
          <span>Solved: {counts.solved}</span>
          <span>Archived: {counts.archived}</span>
        </div>
      </div>

      <div className="admin-news-actions-wrap" style={{ marginBottom: 12, gap: 8 }}>
        {filterKeys.map((key) => (
          <button
            key={key}
            type="button"
            className={`admin-news-btn ${filter === key ? "admin-news-btn-primary" : "admin-news-btn-edit"}`}
            onClick={() => setFilter(key)}
          >
            {key === "all"
              ? "All"
              : key === "in_progress"
                ? "In Progress"
                : key[0]!.toUpperCase() + key.slice(1)}
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
              <th>Type / Subject</th>
              <th>Status</th>
              <th>ETA</th>
              <th>Received</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>Loading…</td>
              </tr>
            ) : visibleItems.length === 0 ? (
              <tr>
                <td colSpan={6}>No contact messages yet.</td>
              </tr>
            ) : (
              visibleItems.map((item) => {
                const open = expandedId === item.id;
                const busy = workingId === item.id;
                const selectedEta = etaDraft[item.id] ?? item.etaHours ?? 24;
                return (
                  <Fragment key={item.id}>
                    <tr>
                      <td>
                        <div style={{ fontWeight: 700 }}>{item.name}</div>
                        <a href={`mailto:${item.email}`} style={{ color: "inherit", opacity: 0.85 }}>
                          {item.email}
                        </a>
                      </td>
                      <td>
                        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                          {topicLabel(item.topic)}
                        </div>
                        {item.subject}
                      </td>
                      <td>
                        <select
                          className="admin-input"
                          style={{ minWidth: 140 }}
                          disabled={busy}
                          value={item.status}
                          onChange={(e) =>
                            void onStatusChange(
                              item,
                              e.target.value as AdminContactItem["status"],
                            )
                          }
                          aria-label="Update message status"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {item.topic === "report" || item.status === "in_progress" ? (
                          <select
                            className="admin-input"
                            style={{ minWidth: 100 }}
                            disabled={busy}
                            value={selectedEta}
                            onChange={(e) => {
                              const hours = Number(e.target.value) === 48 ? 48 : 24;
                              setEtaDraft((prev) => ({ ...prev, [item.id]: hours }));
                            }}
                            aria-label="Resolution ETA"
                          >
                            <option value={24}>24 hours</option>
                            <option value={48}>48 hours</option>
                          </select>
                        ) : (
                          <span style={{ opacity: 0.6 }}>—</span>
                        )}
                        {item.status === "in_progress" && item.etaHours ? (
                          <div style={{ fontSize: 11, marginTop: 4, opacity: 0.75 }}>
                            Active: {item.etaHours}h
                          </div>
                        ) : null}
                      </td>
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
                        <td colSpan={6}>
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
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
