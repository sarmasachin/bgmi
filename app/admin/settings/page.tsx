import { prefetchAdminSettingsPageData } from "@/src/server/admin/prefetchAdminSettingsPageData";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminSettingsClient from "./AdminSettingsClient";

export default async function AdminSettingsPage() {
  const access = await requireAdminPageAccess("settings.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = await prefetchAdminSettingsPageData();
  return <AdminSettingsClient initialData={initialData} />;
}
