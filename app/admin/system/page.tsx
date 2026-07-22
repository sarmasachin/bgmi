import { getSystemHealthData } from "@/src/server/admin/getSystemHealthData";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminSystemClient from "./AdminSystemClient";

export default async function AdminSystemPage() {
  const access = await requireAdminPageAccess("system.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = getSystemHealthData();
  return <AdminSystemClient initialData={initialData} />;
}
