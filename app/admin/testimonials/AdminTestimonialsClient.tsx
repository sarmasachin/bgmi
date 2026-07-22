"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminTestimonialItem } from "@/src/server/admin/mapAdminTestimonials";
import { useAdminFlash } from "@/src/components/admin/AdminToast";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

type Props = {
  initialItems?: AdminTestimonialItem[];
  initialApprovedCount?: number;
  maxApproved?: number;
};

type ConfirmAction = {
  type: "delete" | "reject";
  id: string;
  name: string;
  message: string;
};

const GAME_LABEL: Record<AdminTestimonialItem["game"], string> = {
  bgmi: "BGMI",
  pubg: "PUBG Mobile",
  freefire: "Free Fire",
  "freefire-max": "Free Fire Max",
};

export default function AdminTestimonialsClient({
  initialItems,
  initialApprovedCount = 0,
  maxApproved = 20,
}: Props) {
  const [items, setItems] = useState<AdminTestimonialItem[]>(initialItems ?? []);
  const [approvedCount, setApprovedCount] = useState(initialApprovedCount);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [loading, setLoading] = useState(initialItems === undefined);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const setMessage = useAdminFlash();
  const [visibleCount, setVisibleCount] = useState(10);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const counts = useMemo(() => {
    return {
      all: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      approved: items.filter((item) => item.status === "approved").length,
      rejected: items.filter((item) => item.status === "rejected").length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((item) => item.status === filter);
  }, [items, filter]);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount],
  );
  const hasMore = visibleCount < filteredItems.length;

  async function loadTestimonials() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials", {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        setMessage(
          res.status === 401 || res.status === 307
            ? "Session expired. Please log in again."
            : "Failed to load testimonials.",
        );
        setItems([]);
        return;
      }
      const json = (await res.json()) as {
        data?: Array<Record<string, unknown>>;
        approvedCount?: number;
        maxApproved?: number;
      };

      const next: AdminTestimonialItem[] = (json.data ?? []).map((item) => {
        const gameRaw = String(item.game ?? "bgmi");
        const game: AdminTestimonialItem["game"] =
          gameRaw === "pubg" ||
          gameRaw === "freefire" ||
          gameRaw === "freefire-max"
            ? gameRaw
            : "bgmi";
        const statusRaw = String(item.status ?? "pending");
        const status: AdminTestimonialItem["status"] =
          statusRaw === "approved" || statusRaw === "rejected"
            ? statusRaw
            : "pending";

        return {
          id: String(item.id ?? ""),
          name: String(item.name ?? "Anonymous"),
          email: item.email ? String(item.email) : "",
          rating: Number(item.rating ?? 0),
          message: String(item.message ?? ""),
          game,
          phoneModel: item.phoneModel ? String(item.phoneModel) : "",
          showName: Boolean(item.showName ?? true),
          status,
          createdAt: item.createdAt ? String(item.createdAt) : "",
          approvedAt: item.approvedAt ? String(item.approvedAt) : "",
        };
      });

      setItems(next);
      setApprovedCount(
        typeof json.approvedCount === "number" ? json.approvedCount : next.filter((i) => i.status === "approved").length,
      );
      setVisibleCount(10);
    } catch {
      setMessage("Network error. Please retry.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialItems !== undefined) return;
    void loadTestimonials();
  }, [initialItems]);

  useEffect(() => {
    setVisibleCount(10);
  }, [filter]);

  async function updateStatus(id: string, status: AdminTestimonialItem["status"]) {
    setWorkingId(id);
    setMessage("");
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        trimmed?: number;
        approvedCount?: number;
        error?: string;
      };

      if (!res.ok) {
        setMessage(json.error ?? "Action failed.");
        return false;
      }

      const trimmed = typeof json.trimmed === "number" ? json.trimmed : 0;
      if (status === "approved" && trimmed > 0) {
        setMessage(
          `Approved. Removed ${trimmed} oldest approved to keep max ${maxApproved}.`,
        );
      } else {
        setMessage(`Testimonial marked ${status}.`);
      }

      if (typeof json.approvedCount === "number") {
        setApprovedCount(json.approvedCount);
      }

      // Optimistic local update so the row moves even if reload is slow.
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status,
                approvedAt: status === "approved" ? new Date().toISOString() : "",
              }
            : item,
        ),
      );
      if (status === "approved" || status === "rejected" || status === "pending") {
        setFilter(status);
      }
      await loadTestimonials();
      return true;
    } catch {
      setMessage("Network error. Please retry.");
      return false;
    } finally {
      setWorkingId(null);
    }
  }

  async function removeItem(id: string) {
    setWorkingId(id);
    try {
      const res = await fetch(`/api/admin/testimonials?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = (await res.json()) as {
        ok?: boolean;
        approvedCount?: number;
        error?: string;
      };
      if (!res.ok) {
        setMessage(json.error ?? "Delete failed.");
        return false;
      }
      setMessage("Testimonial deleted.");
      if (typeof json.approvedCount === "number") {
        setApprovedCount(json.approvedCount);
      }
      await loadTestimonials();
      return true;
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
    const ok =
      confirmAction.type === "delete"
        ? await removeItem(confirmAction.id)
        : await updateStatus(confirmAction.id, "rejected");
    setConfirmBusy(false);
    if (ok) setConfirmAction(null);
  }

  return (
    <>
    <section className="admin-section admin-comments-section">
      <div className="admin-comments-head">
        <h1>Testimonials Moderation</h1>
        <div className="admin-comments-stats">
          <span>
            Approved slot: {approvedCount}/{maxApproved}
          </span>
          <span>All: {counts.all}</span>
          <span>Pending: {counts.pending}</span>
          <span>Approved: {counts.approved}</span>
          <span>Rejected: {counts.rejected}</span>
        </div>
      </div>

      <p className="admin-testimonials-hint">
        Approving when the list is full removes the oldest approved testimonial automatically
        (FIFO, max {maxApproved}).
      </p>

      <div className="admin-testimonials-filters" role="tablist" aria-label="Filter by status">
        {(
          [
            ["pending", "Pending"],
            ["approved", "Approved"],
            ["rejected", "Rejected"],
            ["all", "All"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            className={`admin-testimonials-filter${filter === value ? " is-active" : ""}`}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>


      <div className="admin-table-wrap">
        <table className="admin-table admin-comments-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Rating</th>
              <th>Game</th>
              <th>Review</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>Loading testimonials...</td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7}>No testimonials found.</td>
              </tr>
            ) : (
              visibleItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="admin-testimonials-name">
                      <strong>{item.name}</strong>
                      {!item.showName ? (
                        <span className="admin-testimonials-anon">hidden on site</span>
                      ) : null}
                      {item.email ? (
                        <span className="admin-testimonials-phone">{item.email}</span>
                      ) : null}
                      {item.phoneModel ? (
                        <span className="admin-testimonials-phone">{item.phoneModel}</span>
                      ) : null}
                    </div>
                  </td>
                  <td>{item.rating}/5</td>
                  <td>{GAME_LABEL[item.game]}</td>
                  <td className="admin-comments-message-cell">{item.message}</td>
                  <td>
                    <span className={`admin-comments-badge status-${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.createdAt ? item.createdAt.slice(0, 10) : "-"}</td>
                  <td className="admin-comments-actions">
                    <div className="admin-comments-actions-wrap">
                      {item.status !== "approved" ? (
                        <button
                          type="button"
                          className="admin-pages-btn admin-pages-btn-publish"
                          disabled={workingId === item.id}
                          onClick={() => void updateStatus(item.id, "approved")}
                        >
                          Approve
                        </button>
                      ) : null}
                      {item.status !== "rejected" ? (
                        <button
                          type="button"
                          className="admin-pages-btn admin-pages-btn-preview"
                          disabled={workingId === item.id}
                          onClick={() =>
                            setConfirmAction({
                              type: "reject",
                              id: item.id,
                              name: item.name,
                              message: item.message,
                            })
                          }
                        >
                          Reject
                        </button>
                      ) : null}
                      {item.status !== "pending" ? (
                        <button
                          type="button"
                          className="admin-pages-btn admin-pages-btn-edit"
                          disabled={workingId === item.id}
                          onClick={() => void updateStatus(item.id, "pending")}
                        >
                          Pending
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="admin-pages-btn admin-pages-btn-delete"
                        disabled={workingId === item.id}
                        onClick={() =>
                          setConfirmAction({
                            type: "delete",
                            id: item.id,
                            name: item.name,
                            message: item.message,
                          })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && hasMore ? (
        <div className="admin-comments-load-more-wrap">
          <button
            type="button"
            className="admin-comments-load-more"
            onClick={() => setVisibleCount((prev) => prev + 10)}
          >
            Load More
          </button>
        </div>
      ) : null}
    </section>

    {confirmAction ? (
      <div className="admin-modal-overlay" role="presentation" onClick={closeConfirmModal}>
        <div
          className={`admin-modal admin-confirm-modal ${
            confirmAction.type === "delete" ? "is-danger" : "is-warning"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-testimonials-confirm-title"
          aria-describedby="admin-testimonials-confirm-desc"
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
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <path
                  d="M12 9v4.5M12 17h.01M10.3 4.2 2.7 17.1A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.9L13.7 4.2a2 2 0 0 0-3.4 0Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <h2 id="admin-testimonials-confirm-title">
            {confirmAction.type === "delete" ? "Delete this testimonial?" : "Reject this testimonial?"}
          </h2>
          <p id="admin-testimonials-confirm-desc" className="admin-modal-subtitle">
            {confirmAction.type === "delete"
              ? "This will permanently remove the testimonial. This action cannot be undone."
              : "This testimonial will be marked as rejected and will not appear on the live site."}
          </p>
          <div className="admin-confirm-meta">
            <span className="admin-confirm-meta-label">Testimonial</span>
            <strong>{confirmAction.name}</strong>
            <span className="admin-confirm-meta-slug">
              {confirmAction.message.length > 120
                ? `${confirmAction.message.slice(0, 120)}…`
                : confirmAction.message}
            </span>
          </div>
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
                confirmAction.type === "delete" ? "admin-modal-btn-danger" : "admin-modal-btn-warning"
              }`}
              onClick={() => void confirmPendingAction()}
              disabled={confirmBusy}
            >
              {confirmBusy
                ? confirmAction.type === "delete"
                  ? "Deleting…"
                  : "Rejecting…"
                : confirmAction.type === "delete"
                  ? "Yes, delete"
                  : "Yes, reject"}
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
