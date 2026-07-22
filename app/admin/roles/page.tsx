import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { listAdminRoleDefinitions } from "@/src/server/repositories/adminRolesRepository";
import AdminRolesClient from "./AdminRolesClient";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const access = await requireAdminPageAccess("users.manage");
  if (!access.ok) return <AdminAccessDenied />;

  const initialRows = await listAdminRoleDefinitions();
  return <AdminRolesClient initialRows={initialRows} />;
}
