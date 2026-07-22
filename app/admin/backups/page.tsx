import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminBackupsClient from "./AdminBackupsClient";

/** Static shell SSR — no admin/loading.tsx flash on refresh. */
export default async function AdminBackupsPage() {
  const access = await requireAdminPageAccess(["backups.download", "backups.restore"]);
  if (!access.ok) return <AdminAccessDenied />;
  return <AdminBackupsClient />;
}
