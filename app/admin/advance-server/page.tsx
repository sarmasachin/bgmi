import { getAdvanceServerPageForAdmin } from "@/src/server/repositories/advanceServerPageRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminAdvanceServerClient from "./AdminAdvanceServerClient";

export const dynamic = "force-dynamic";

export default async function AdminAdvanceServerPage() {
  const access = await requireAdminPageAccess("advanceServer.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = await getAdvanceServerPageForAdmin();
  return <AdminAdvanceServerClient initialData={initialData} />;
}
