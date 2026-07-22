import { getAdminAuditRows } from "@/src/server/repositories/adminAuditRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminAuditClient from "./AdminAuditClient";

export default async function AdminAuditPage() {
  const access = await requireAdminPageAccess("audit.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialRows = await getAdminAuditRows();
  return <AdminAuditClient initialRows={initialRows} />;
}
