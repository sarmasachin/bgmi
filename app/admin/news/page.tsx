import { mapAdminNewsRows } from "@/src/server/admin/mapAdminNewsRows";
import { listNews } from "@/src/server/repositories/newsRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminNewsClient from "./AdminNewsClient";

export default async function AdminNewsPage() {
  const access = await requireAdminPageAccess("news.view");
  if (!access.ok) return <AdminAccessDenied />;

  const result = await listNews(1, 10);
  const initialRows = mapAdminNewsRows(result.data);
  return <AdminNewsClient initialRows={initialRows} initialTotal={result.total} />;
}
