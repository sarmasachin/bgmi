import { mapAdminPageRows } from "@/src/server/admin/mapAdminPageRows";
import { listPages } from "@/src/server/repositories/pagesRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminPagesClient from "./AdminPagesClient";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const access = await requireAdminPageAccess("pages.view");
  if (!access.ok) return <AdminAccessDenied />;

  const pages = await listPages();
  const initialRows = mapAdminPageRows(pages);
  return <AdminPagesClient initialRows={initialRows} />;
}
