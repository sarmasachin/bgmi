import { mapAdminComments } from "@/src/server/admin/mapAdminComments";
import { listComments } from "@/src/server/repositories/commentsRepository";
import AdminCommentsClient from "./AdminCommentsClient";

export default async function AdminCommentsPage() {
  const items = await listComments();
  const initialItems = mapAdminComments(items);
  return <AdminCommentsClient initialItems={initialItems} />;
}
