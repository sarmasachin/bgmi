import { mapAdminComments } from "@/src/server/admin/mapAdminComments";
import { listComments } from "@/src/server/repositories/commentsRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminCommentsClient from "./AdminCommentsClient";

export default async function AdminCommentsPage() {
  const access = await requireAdminPageAccess("comments.view");
  if (!access.ok) return <AdminAccessDenied />;

  const items = await listComments();
  const initialItems = mapAdminComments(items);
  return <AdminCommentsClient initialItems={initialItems} />;
}
