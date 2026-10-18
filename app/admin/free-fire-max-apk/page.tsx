import { getFreeFireMaxApkPageForAdmin } from "@/src/server/repositories/freeFireMaxApkPageRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { DEFAULT_FREE_FIRE_MAX_APK_PAGE } from "@/src/lib/freeFireMaxApkPage";
import AdminFreeFireMaxApkClient from "./AdminFreeFireMaxApkClient";

export const dynamic = "force-dynamic";

export default async function AdminFreeFireMaxApkPage() {
  const access = await requireAdminPageAccess("freeFireMaxApk.view");
  if (!access.ok) return <AdminAccessDenied />;

  let initialData = { page: DEFAULT_FREE_FIRE_MAX_APK_PAGE, usingDefault: true };
  try {
    initialData = await getFreeFireMaxApkPageForAdmin();
  } catch {
    initialData = { page: DEFAULT_FREE_FIRE_MAX_APK_PAGE, usingDefault: true };
  }

  return <AdminFreeFireMaxApkClient initialData={initialData} />;
}
