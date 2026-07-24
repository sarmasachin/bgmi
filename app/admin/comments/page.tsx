import { mapAdminComments } from "@/src/server/admin/mapAdminComments";
import { listComments } from "@/src/server/repositories/commentsRepository";
import { listAllPageComments } from "@/src/server/repositories/pageCommentsRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminCommentsClient from "./AdminCommentsClient";

function toIso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return "";
}

export default async function AdminCommentsPage() {
  const access = await requireAdminPageAccess("comments.view");
  if (!access.ok) return <AdminAccessDenied />;

  const [newsComments, pageComments] = await Promise.all([
    listComments(),
    listAllPageComments(),
  ]);

  const merged = [
    ...newsComments.map((item) => ({
      ...item,
      createdAt: toIso((item as { createdAt?: unknown }).createdAt),
      source: "news" as const,
      pageKey: "",
    })),
    ...pageComments.map((item) => ({
      id: item.id,
      name: item.name,
      message: item.message,
      status: item.status,
      createdAt: toIso(item.createdAt),
      newsId: "",
      source: "page" as const,
      pageKey: item.pageKey,
      email: "email" in item && item.email ? String(item.email) : "",
    })),
  ].sort((a, b) => {
    const ta = Date.parse(a.createdAt || "") || 0;
    const tb = Date.parse(b.createdAt || "") || 0;
    return tb - ta;
  });

  const initialItems = mapAdminComments(merged);
  return <AdminCommentsClient initialItems={initialItems} />;
}
