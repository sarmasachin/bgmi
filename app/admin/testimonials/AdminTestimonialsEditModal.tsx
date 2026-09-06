"use client";

import { useState } from "react";
import { AdminDialogModal } from "@/src/components/admin/AdminDialogModal";
import type { AdminTestimonialItem } from "@/src/server/admin/mapAdminTestimonials";

type Props = {
  item: AdminTestimonialItem;
  saving: boolean;
  onClose: () => void;
  onSave: (message: string) => void;
};

/** Edit review text. Status stays the same; FIFO is not triggered. */
export function AdminTestimonialsEditModal({ item, saving, onClose, onSave }: Props) {
  const [message, setMessage] = useState(item.message);
  const trimmed = message.trim();
  const invalid = trimmed.length < 2 || trimmed.length > 300;

  return (
    <AdminDialogModal
      title="Edit review"
      subtitle={`${item.name} — status stays ${item.status}. Live site updates only if this row is approved.`}
      onClose={() => {
        if (!saving) onClose();
      }}
      actions={
        <>
          <button
            type="button"
            className="admin-modal-btn-secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="admin-modal-btn-primary"
            disabled={saving || invalid}
            onClick={() => onSave(trimmed)}
          >
            {saving ? "Saving…" : "Save review"}
          </button>
        </>
      }
    >
      <label className="admin-redeem-field">
        <span>Review</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          maxLength={300}
          disabled={saving}
          className="admin-redeem-input"
          style={{ resize: "vertical" }}
        />
      </label>
      <p className="admin-redeem-hint" style={{ marginTop: 8 }}>
        {trimmed.length}/300
      </p>
    </AdminDialogModal>
  );
}
