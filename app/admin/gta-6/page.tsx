import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { DEFAULT_GTA6_PAGE } from "@/src/lib/gta6PageDefaults";
import { getGta6PageForAdmin } from "@/src/server/repositories/gta6PageRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import AdminGta6Client from "./AdminGta6Client";

export const dynamic = "force-dynamic";

export default async function AdminGta6Page() {
  const access = await requireAdminPageAccess("gta6.view");
  if (!access.ok) return <AdminAccessDenied />;

  let initialData = { page: DEFAULT_GTA6_PAGE, usingDefault: true };
  try {
    initialData = await getGta6PageForAdmin();
  } catch {
    initialData = { page: DEFAULT_GTA6_PAGE, usingDefault: true };
  }

  return <AdminGta6Client initialData={initialData} />;
}
