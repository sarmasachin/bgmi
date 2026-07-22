"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import type { AdminContactItem } from "@/src/server/admin/mapAdminContactMessages";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";

type Props = {
  initialItems?: AdminContactItem[];
};

type StatusFilter = "all" | AdminContactItem["status"];

type ConfirmAction =
  | {
      type: "delete";
      id: string;
      name: string;
      email: string;
      subject: string;
    }
  | {
      type: "in_progress";
      id: string;
      name: string;
      email: string;
      subject: string;
      etaHours: 24 | 48;
    }
  | {
      type: "solved";
      id: string;
      name: string;
      email: string;
      subject: string;
    };

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
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
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
      return res.ok;
    } catch {
      setMessage("Network error. Please retry.");
      return false;
    } finally {
      setWorkingId(null);
    }
  }

  function onStatusChange(item: AdminContactItem, next: AdminContactItem["status"]) {
    if (next === item.status) return;

    if (next === "in_progress") {
      const hours = etaDraft[item.id] ?? item.etaHours ?? 24;
      setConfirmAction({
        type: "in_progress",
        id: item.id,
        name: item.name,
        email: item.email,
        subject: item.subject,
        etaHours: hours,
      });
      return;
    }

    if (next === "solved") {
      setConfirmAction({
        type: "solved",
        id: item.id,
        name: item.name,
        email: item.email,
        subject: item.subject,
      });
      return;
    }

    void updateStatus(item.id, next);
  }

  async function removeMessage(id: string) {
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
      return res.ok;
    } catch {
      setMessage("Network error. Please retry.");
      return false;
    } finally {
      setWorkingId(null);
    }
  }

  function closeConfirmModal() {
    if (confirmBusy) return;
    setConfirmAction(null);
  }

  async function confirmPendingAction() {
    if (!confirmAction || confirmBusy) return;
    setConfirmBusy(true);
    let ok = false;
    if (confirmAction.type === "delete") {
      ok = await removeMessage(confirmAction.id);
    } else if (confirmAction.type === "in_progress") {
      ok = await updateStatus(confirmAction.id, "in_progress", confirmAction.etaHours);
    } else {
      ok = await updateStatus(confirmAction.id, "solved");
    }
    setConfirmBusy(false);
    if (ok) setConfirmAction(null);
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
    <>
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
                            onClick={() =>
                              setConfirmAction({
                                type: "delete",
                                id: item.id,
                                name: item.name,
                                email: item.email,
                                subject: item.subject,
                              })
                            }
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

    {confirmAction ? (
      <div className="admin-modal-overlay" role="presentation" onClick={closeConfirmModal}>
        <div
          className={`admin-modal admin-confirm-modal ${
            confirmAction.type === "delete"
              ? "is-danger"
              : confirmAction.type === "solved"
                ? "is-success"
                : "is-info"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-contact-confirm-title"
          aria-describedby="admin-contact-confirm-desc"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="admin-confirm-icon" aria-hidden>
            {confirmAction.type === "delete" ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <path
                  d="M9 3h6m-8 4h10m-9 0 .7 12.2A1.5 1.5 0 0 0 10.2 21h3.6a1.5 1.5 0 0 0 1.5-1.4L16 7M10 11v6m4-6v6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : confirmAction.type === "solved" ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <path
                  d="M20 7 10.2 17.2 4 11.2"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <path
                  d="M4 7.5 12 13l8-5.5M5.5 18h13A1.5 1.5 0 0 0 20 16.5v-9A1.5 1.5 0 0 0 18.5 6h-13A1.5 1.5 0 0 0 4 7.5v9A1.5 1.5 0 0 0 5.5 18Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          <h2 id="admin-contact-confirm-title">
            {confirmAction.type === "delete"
              ? "Delete this message?"
              : confirmAction.type === "in_progress"
                ? "Mark as In Progress?"
                : "Mark as Solved?"}
          </h2>
          <p id="admin-contact-confirm-desc" className="admin-modal-subtitle">
            {confirmAction.type === "delete"
              ? "This will permanently remove the contact message. This action cannot be undone."
              : confirmAction.type === "in_progress"
                ? `The user will get an email that the issue will be resolved within ${confirmAction.etaHours} hours.`
                : "The user will get an email that the problem has been resolved."}
          </p>

          <div className="admin-confirm-meta admin-confirm-meta-rich">
            <div className="admin-confirm-meta-row">
              <span className="admin-confirm-meta-label">From</span>
              <strong>{confirmAction.name}</strong>
              <span className="admin-confirm-meta-slug">{confirmAction.email}</span>
            </div>
            <div className="admin-confirm-meta-row">
              <span className="admin-confirm-meta-label">Subject</span>
              <strong>{confirmAction.subject || "No subject"}</strong>
            </div>
            {confirmAction.type === "in_progress" ? (
              <div className="admin-confirm-meta-row">
                <span className="admin-confirm-meta-label">ETA</span>
                <span className="admin-confirm-pill">{confirmAction.etaHours} hours</span>
              </div>
            ) : null}
          </div>

          {confirmAction.type !== "delete" ? (
            <div className="admin-confirm-note" role="note">
              <span className="admin-confirm-note-dot" aria-hidden />
              Email notification will be sent to the user.
            </div>
          ) : null}

          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-modal-btn-secondary"
              onClick={closeConfirmModal}
              disabled={confirmBusy}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`admin-modal-btn-primary ${
                confirmAction.type === "delete"
                  ? "admin-modal-btn-danger"
                  : confirmAction.type === "solved"
                    ? "admin-modal-btn-success"
                    : "admin-modal-btn-info"
              }`}
              onClick={() => void confirmPendingAction()}
              disabled={confirmBusy}
            >
              {confirmBusy
                ? confirmAction.type === "delete"
                  ? "Deleting…"
                  : "Updating…"
                : confirmAction.type === "delete"
                  ? "Yes, delete"
                  : confirmAction.type === "in_progress"
                    ? "Yes, mark In Progress"
                    : "Yes, mark Solved"}
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
