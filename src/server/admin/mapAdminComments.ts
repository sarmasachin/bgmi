export type AdminCommentItem = {
  id: string;
  name: string;
  message: string;
  status: "pending" | "approved" | "rejected" | "spam";
  createdAt?: string;
  newsId?: string;
};

export function mapAdminComments(
  items: Array<{
    id: string;
    name?: string | null;
    message?: string | null;
    status?: string | null;
    createdAt?: Date | string | null;
    newsId?: string | null;
  }>,
): AdminCommentItem[] {
  return items.map((item) => ({
    id: String(item.id ?? ""),
    name: String(item.name ?? "Anonymous"),
    message: String(item.message ?? ""),
    status: (item.status as AdminCommentItem["status"]) ?? "pending",
    createdAt:
      item.createdAt instanceof Date
        ? item.createdAt.toISOString()
        : item.createdAt
          ? String(item.createdAt)
          : "",
    newsId: item.newsId ? String(item.newsId) : "",
  }));
}
