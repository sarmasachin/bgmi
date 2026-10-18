import { getFreeFireApkPageForAdmin } from "@/src/server/repositories/freeFireApkPageRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { DEFAULT_FREE_FIRE_APK_PAGE } from "@/src/lib/freeFireApkPage";
import AdminFreeFireApkClient from "./AdminFreeFireApkClient";

export const dynamic = "force-dynamic";

export default async function AdminFreeFireApkPage() {
  const access = await requireAdminPageAccess("freeFireApk.view");
  if (!access.ok) return <AdminAccessDenied />;

  let initialData = { page: DEFAULT_FREE_FIRE_APK_PAGE, usingDefault: true };
  try {
    initialData = await getFreeFireApkPageForAdmin();
  } catch {
    initialData = { page: DEFAULT_FREE_FIRE_APK_PAGE, usingDefault: true };
  }

  return <AdminFreeFireApkClient initialData={initialData} />;
}
