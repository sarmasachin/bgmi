"use client";

import { useEffect, useMemo, useState } from "react";

type CommentItem = {
  id: string;
  name: string;
  message: string;
  status: "pending" | "approved" | "rejected" | "spam";
  createdAt?: string;
  newsId?: string;
};

export default function AdminCommentsPage() {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

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
    void loadComments();
  }, []);

  async function updateStatus(id: string, status: CommentItem["status"]) {
    setWorkingId(id);
    try {
      const res = await fetch("/api/admin/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      setMessage(res.ok ? `Comment marked ${status}.` : "Action failed.");
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
      setMessage(res.ok ? "Comment deleted." : "Delete failed.");
      if (res.ok) await loadComments();
    } catch {
      setMessage("Network error. Please retry.");
    }
    setWorkingId(null);
  }

  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = visibleCount < items.length;

  return (
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

      {message ? <p className="admin-comments-message">{message}</p> : null}

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
                        onClick={() => void removeComment(item.id)}
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
  );
}
