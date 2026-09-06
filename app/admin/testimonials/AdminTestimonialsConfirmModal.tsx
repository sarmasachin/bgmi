type ConfirmAction = {
  type: "delete" | "reject";
  id: string;
  name: string;
  message: string;
};

type Props = {
  confirmAction: ConfirmAction;
  confirmBusy: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

/** Reject / delete confirmation for testimonials moderation. */
export function AdminTestimonialsConfirmModal({
  confirmAction,
  confirmBusy,
  onClose,
  onConfirm,
}: Props) {
  return (
    <div className="admin-modal-overlay" role="presentation" onClick={onClose}>
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
            onClick={onClose}
            disabled={confirmBusy}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`admin-modal-btn-primary ${
              confirmAction.type === "delete" ? "admin-modal-btn-danger" : "admin-modal-btn-warning"
            }`}
            onClick={onConfirm}
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
  );
}

export type { ConfirmAction as TestimonialsConfirmAction };
