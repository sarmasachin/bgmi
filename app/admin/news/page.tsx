import { mapAdminNewsRows } from "@/src/server/admin/mapAdminNewsRows";
import { getNewsListingSeo } from "@/src/server/repositories/listingSeoRepository";
import { listNews } from "@/src/server/repositories/newsRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminNewsClient from "./AdminNewsClient";

export default async function AdminNewsPage() {
  const access = await requireAdminPageAccess("news.view");
  if (!access.ok) return <AdminAccessDenied />;

  const [result, listingSeo] = await Promise.all([listNews(1, 10), getNewsListingSeo()]);
  const initialRows = mapAdminNewsRows(result.data);
  return (
    <AdminNewsClient
      initialRows={initialRows}
      initialTotal={result.total}
      initialListingSeo={listingSeo}
    />
  );
}
