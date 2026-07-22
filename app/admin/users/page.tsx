import { listAdminUsers } from "@/src/server/repositories/adminUsersRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminUsersClient from "./AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const access = await requireAdminPageAccess("users.manage");
  if (!access.ok) {
    return (
      <AdminAccessDenied message="Access denied. Only superadmins can manage users and permissions." />
    );
  }

  const initialRows = await listAdminUsers();
  return (
    <AdminUsersClient
      initialRows={initialRows}
      me={{ id: access.subject.userId, email: access.subject.email, role: access.subject.role }}
    />
  );
}
