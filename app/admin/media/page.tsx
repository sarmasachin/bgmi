import { prefetchAdminMediaPageData } from "@/src/server/admin/prefetchAdminMediaPageData";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminMediaClient from "./AdminMediaClient";

export default async function AdminMediaPage() {
  const access = await requireAdminPageAccess("media.view");
  if (!access.ok) return <AdminAccessDenied />;

  const { initialFiles, initialOutputPref } = await prefetchAdminMediaPageData();
  return <AdminMediaClient initialFiles={initialFiles} initialOutputPref={initialOutputPref} />;
}
