import { mapAdminNewsCategoryRows } from "@/src/server/admin/mapAdminNewsCategoryRows";
import { listNewsCategories } from "@/src/server/repositories/newsCategoryRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminNewsCategoriesClient from "./AdminNewsCategoriesClient";

export default async function AdminNewsCategoriesPage() {
  const access = await requireAdminPageAccess("news.view");
  if (!access.ok) return <AdminAccessDenied />;

  const rows = await listNewsCategories();
  return <AdminNewsCategoriesClient initialRows={mapAdminNewsCategoryRows(rows)} />;
}
