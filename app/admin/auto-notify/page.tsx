import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { getAutoNotifySettings } from "@/src/server/repositories/autoNotifySettingsRepository";
import AdminAutoNotifyClient from "./AdminAutoNotifyClient";

export default async function AdminAutoNotifyPage() {
  const access = await requireAdminPageAccess("notifications.view");
  if (!access.ok) return <AdminAccessDenied />;

  let initialSettings = { newsOnPublish: false, pagesOnPublish: false };
  try {
    initialSettings = await getAutoNotifySettings();
  } catch {
    /* defaults */
  }

  return <AdminAutoNotifyClient initialSettings={initialSettings} />;
}
