"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminCommentItem } from "@/src/server/admin/mapAdminComments";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";

type CommentItem = AdminCommentItem;

type Props = {
  initialItems?: CommentItem[];
};

type ConfirmDelete = {
  id: string;
  name: string;
  message: string;
};

export default function AdminCommentsClient({ initialItems }: Props) {
  const [items, setItems] = useState<CommentItem[]>(initialItems ?? []);
  const [loading, setLoading] = useState(initialItems === undefined);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const setMessage = useAdminFlash();
  const [visibleCount, setVisibleCount] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const counts = useMemo(() => {
    return {
      all: items.length,
      pending: items.filter((item) => item.status === "pending").length,
      approved: items.filter((item) => item.status === "approved").length,
      rejected: items.filter((item) => item.status === "rejected").length,
      spam: items.filter((item) => item.status === "spam").length,
    };
  }, [items]);

  async function loadComments() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/comments");
      if (!res.ok) {
        setMessage("Failed to load comments.");
        setItems([]);
        return;
      }
      const json = (await res.json()) as { data?: Array<Record<string, unknown>> };
      const next = (json.data ?? []).map((item) => ({
        id: String(item.id ?? ""),
        name: String(item.name ?? "Anonymous"),
        message: String(item.message ?? ""),
        status: (item.status as CommentItem["status"]) ?? "pending",
        createdAt: item.createdAt ? String(item.createdAt) : "",
        newsId: item.newsId ? String(item.newsId) : "",
      }));
      setItems(next);
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
    void loadComments();
  }, [initialItems]);

  async function updateStatus(id: string, status: CommentItem["status"]) {
    setWorkingId(id);
    try {
      const res = await fetch("/api/admin/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setMessage(
        res.ok
          ? `Comment marked ${status}.`
          : await readApiError(res, "Action failed."),
      );
      if (res.ok) await loadComments();
    } catch {
      setMessage("Network error. Please retry.");
    }
    setWorkingId(null);
  }

  async function removeComment(id: string) {
    setWorkingId(id);
    try {
      const res = await fetch(`/api/admin/comments?id=${id}`, { method: "DELETE" });
      setMessage(res.ok ? "Comment deleted." : await readApiError(res, "Delete failed."));
      if (res.ok) await loadComments();
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
    setConfirmDelete(null);
  }

  async function confirmPendingDelete() {
    if (!confirmDelete || confirmBusy) return;
    setConfirmBusy(true);
    const ok = await removeComment(confirmDelete.id);
    setConfirmBusy(false);
    if (ok) setConfirmDelete(null);
  }

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = visibleCount < items.length;

  return (
    <>
      <section className="admin-section admin-comments-section">
        <div className="admin-comments-head">
          <h1>Comments Moderation</h1>
          <div className="admin-comments-stats">
            <span>All: {counts.all}</span>
            <span>Pending: {counts.pending}</span>
            <span>Approved: {counts.approved}</span>
            <span>Rejected: {counts.rejected}</span>
            <span>Spam: {counts.spam}</span>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table admin-comments-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Comment</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>Loading comments...</td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5}>No comments found.</td>
                </tr>
              ) : (
                visibleItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td className="admin-comments-message-cell">{item.message}</td>
                    <td>
                      <span className={`admin-comments-badge status-${item.status}`}>{item.status}</span>
                    </td>
                    <td>{item.createdAt ? item.createdAt.slice(0, 10) : "-"}</td>
                    <td className="admin-comments-actions">
                      <div className="admin-comments-actions-wrap">
                        <button
                          type="button"
                          className="admin-pages-btn admin-pages-btn-publish"
                          disabled={workingId === item.id}
                          onClick={() => void updateStatus(item.id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="admin-pages-btn admin-pages-btn-preview"
                          disabled={workingId === item.id}
                          onClick={() => void updateStatus(item.id, "rejected")}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className="admin-pages-btn admin-pages-btn-edit"
                          disabled={workingId === item.id}
                          onClick={() => void updateStatus(item.id, "spam")}
                        >
                          Spam
                        </button>
                        <button
                          type="button"
                          className="admin-pages-btn admin-pages-btn-delete"
                          disabled={workingId === item.id}
                          onClick={() =>
                            setConfirmDelete({
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
            <button type="button" className="admin-comments-load-more" onClick={() => setVisibleCount((prev) => prev + 10)}>
              Load More
            </button>
          </div>
        ) : null}
      </section>

      {confirmDelete ? (
        <div className="admin-modal-overlay" role="presentation" onClick={closeConfirmModal}>
          <div
            className="admin-modal admin-confirm-modal is-danger"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-comments-confirm-title"
            aria-describedby="admin-comments-confirm-desc"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-confirm-icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                <path
                  d="M9 3h6m-8 4h10m-9 0 .7 12.2A1.5 1.5 0 0 0 10.2 21h3.6a1.5 1.5 0 0 0 1.5-1.4L16 7M10 11v6m4-6v6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 id="admin-comments-confirm-title">Delete this comment?</h2>
            <p id="admin-comments-confirm-desc" className="admin-modal-subtitle">
              This will permanently remove the comment. This action cannot be undone.
            </p>
            <div className="admin-confirm-meta">
              <span className="admin-confirm-meta-label">Comment</span>
              <strong>{confirmDelete.name}</strong>
              <span className="admin-confirm-meta-slug">
                {confirmDelete.message.length > 120
                  ? `${confirmDelete.message.slice(0, 120)}…`
                  : confirmDelete.message}
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
                className="admin-modal-btn-primary admin-modal-btn-danger"
                onClick={() => void confirmPendingDelete()}
                disabled={confirmBusy}
              >
                {confirmBusy ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
