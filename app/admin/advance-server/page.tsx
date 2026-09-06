import { getAdvanceServerPageForAdmin } from "@/src/server/repositories/advanceServerPageRepository";
import { getDefaultAdvanceServerPage } from "@/src/lib/ffAdvanceServerPage";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminAdvanceServerClient from "./AdminAdvanceServerClient";

export const dynamic = "force-dynamic";

export default async function AdminAdvanceServerPage() {
  const access = await requireAdminPageAccess("advanceServer.view");
  if (!access.ok) return <AdminAccessDenied />;

  let initialData = { page: getDefaultAdvanceServerPage(), usingDefault: true };
  let loadError = false;
  try {
    initialData = await getAdvanceServerPageForAdmin();
  } catch {
    loadError = true;
  }

  return <AdminAdvanceServerClient initialData={initialData} loadError={loadError} />;
}
