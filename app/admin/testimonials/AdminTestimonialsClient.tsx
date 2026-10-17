"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminTestimonialItem } from "@/src/server/admin/mapAdminTestimonials";
import { parseAdminTestimonialJson } from "@/src/server/admin/mapAdminTestimonials";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import {
  AdminTestimonialsConfirmModal,
  type TestimonialsConfirmAction,
} from "./AdminTestimonialsConfirmModal";
import { AdminTestimonialsEditModal } from "./AdminTestimonialsEditModal";
import { AdminTestimonialsTable } from "./AdminTestimonialsTable";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

type Props = {
  initialItems?: AdminTestimonialItem[];
  maxApproved?: number;
};

export default function AdminTestimonialsClient({
  initialItems,
  maxApproved = 20,
}: Props) {
  const [items, setItems] = useState<AdminTestimonialItem[]>(initialItems ?? []);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [loading, setLoading] = useState(initialItems === undefined);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const setMessage = useAdminFlash();
  const [visibleCount, setVisibleCount] = useState(10);
  const [confirmAction, setConfirmAction] = useState<TestimonialsConfirmAction | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [editItem, setEditItem] = useState<AdminTestimonialItem | null>(null);
  const [editSaving, setEditSaving] = useState(false);

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
      };
      const next = (json.data ?? []).map(parseAdminTestimonialJson);
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
        error?: string;
      };

      if (!res.ok) {
        setMessage(json.error ?? "Action failed.");
        return false;
      }

      const trimmed = typeof json.trimmed === "number" ? json.trimmed : 0;
      if (status === "approved" && trimmed > 0) {
        setMessage(
          `Approved. Removed ${trimmed} oldest approved for this game (max ${maxApproved} / game).`,
        );
      } else {
        setMessage(`Testimonial marked ${status}.`);
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status, approvedAt: status === "approved" ? new Date().toISOString() : "" }
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
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setMessage(json.error ?? "Delete failed.");
        return false;
      }
      setMessage("Testimonial deleted.");
      await loadTestimonials();
      return true;
    } catch {
      setMessage("Network error. Please retry.");
      return false;
    } finally {
      setWorkingId(null);
    }
  }

  async function saveEdit(message: string) {
    if (!editItem || editSaving) return;
    setEditSaving(true);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: editItem.id, message }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        data?: Record<string, unknown>;
      };
      if (!res.ok) {
        setMessage(json.error ?? "Could not save review.");
        return;
      }
      const saved = json.data
        ? parseAdminTestimonialJson(json.data)
        : { ...editItem, message };
      setItems((prev) =>
        prev.map((row) => (row.id === editItem.id ? saved : row)),
      );
      setMessage("Review updated.");
      setEditItem(null);
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setEditSaving(false);
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
          <span>Max {maxApproved} / game</span>
          <span>All: {counts.all}</span>
          <span>Pending: {counts.pending}</span>
          <span>Approved: {counts.approved}</span>
          <span>Rejected: {counts.rejected}</span>
        </div>
      </div>

      <p className="admin-testimonials-hint">
        Each game can have up to {maxApproved} approved. Approving when that game is full removes
        the oldest approved for the same game only (FIFO). Other games are not touched. Edit
        changes review text only — it does not approve or trim.
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

      <AdminTestimonialsTable
        loading={loading}
        filteredCount={filteredItems.length}
        visibleItems={visibleItems}
        workingId={workingId}
        hasMore={hasMore}
        onEdit={setEditItem}
        onApprove={(id) => void updateStatus(id, "approved")}
        onPending={(id) => void updateStatus(id, "pending")}
        onConfirm={setConfirmAction}
        onLoadMore={() => setVisibleCount((prev) => prev + 10)}
      />
    </section>

    {confirmAction ? (
      <AdminTestimonialsConfirmModal
        confirmAction={confirmAction}
        confirmBusy={confirmBusy}
        onClose={closeConfirmModal}
        onConfirm={() => void confirmPendingAction()}
      />
    ) : null}

    {editItem ? (
      <AdminTestimonialsEditModal
        item={editItem}
        saving={editSaving}
        onClose={() => {
          if (!editSaving) setEditItem(null);
        }}
        onSave={(message) => void saveEdit(message)}
      />
    ) : null}
    </>
  );
}
