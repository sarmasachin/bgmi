import type { AdminTestimonialItem } from "@/src/server/admin/mapAdminTestimonials";
import type { TestimonialsConfirmAction } from "./AdminTestimonialsConfirmModal";

const GAME_LABEL: Record<AdminTestimonialItem["game"], string> = {
  bgmi: "BGMI",
  "bgmi-lite": "BGMI Air",
  pubg: "PUBG Mobile",
  "pubg-mobile-lite": "PUBG Mobile Flash",
  freefire: "Free Fire",
  "freefire-max": "Free Fire Max",
};

type Props = {
  loading: boolean;
  filteredCount: number;
  visibleItems: AdminTestimonialItem[];
  workingId: string | null;
  hasMore: boolean;
  onEdit: (item: AdminTestimonialItem) => void;
  onApprove: (id: string) => void;
  onPending: (id: string) => void;
  onConfirm: (action: TestimonialsConfirmAction) => void;
  onLoadMore: () => void;
};

/** Testimonials moderation table + load more. */
export function AdminTestimonialsTable({
  loading,
  filteredCount,
  visibleItems,
  workingId,
  hasMore,
  onEdit,
  onApprove,
  onPending,
  onConfirm,
  onLoadMore,
}: Props) {
  return (
    <>
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
            ) : filteredCount === 0 ? (
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
                      <button
                        type="button"
                        className="admin-pages-btn admin-pages-btn-edit"
                        disabled={workingId === item.id}
                        onClick={() => onEdit(item)}
                      >
                        Edit
                      </button>
                      {item.status !== "approved" ? (
                        <button
                          type="button"
                          className="admin-pages-btn admin-pages-btn-publish"
                          disabled={workingId === item.id}
                          onClick={() => onApprove(item.id)}
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
                            onConfirm({
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
                          onClick={() => onPending(item.id)}
                        >
                          Pending
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="admin-pages-btn admin-pages-btn-delete"
                        disabled={workingId === item.id}
                        onClick={() =>
                          onConfirm({
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
            onClick={onLoadMore}
          >
            Load More
          </button>
        </div>
      ) : null}
    </>
  );
}
