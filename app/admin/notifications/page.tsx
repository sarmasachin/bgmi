import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminNotificationsClient from "./AdminNotificationsClient";

export default async function AdminNotificationsPage() {
  const access = await requireAdminPageAccess("notifications.view");
  if (!access.ok) return <AdminAccessDenied />;
  return <AdminNotificationsClient />;
}
