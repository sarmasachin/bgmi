import { getFreeFireIndiaApkPageForAdmin } from "@/src/server/repositories/freeFireIndiaApkPageRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { DEFAULT_FREE_FIRE_INDIA_APK_PAGE, FREE_FIRE_INDIA_APK_PATH } from "@/src/lib/freeFireIndiaApkPage";
import AdminFreeFireApkClient from "../free-fire-apk/AdminFreeFireApkClient";

export const dynamic = "force-dynamic";

export default async function AdminFreeFireIndiaApkPage() {
  const access = await requireAdminPageAccess("freeFireIndiaApk.view");
  if (!access.ok) return <AdminAccessDenied />;

  let initialData = { page: DEFAULT_FREE_FIRE_INDIA_APK_PAGE, usingDefault: true };
  try {
    initialData = await getFreeFireIndiaApkPageForAdmin();
  } catch {
    initialData = { page: DEFAULT_FREE_FIRE_INDIA_APK_PAGE, usingDefault: true };
  }

  return (
    <AdminFreeFireApkClient
      initialData={initialData}
      apiPath="/api/admin/free-fire-india-apk"
      title="FF India Apk"
      previewPath={FREE_FIRE_INDIA_APK_PATH}
      savedMessage="FF India Apk page saved."
      saveError="Could not save FF India Apk page."
      boundaryLabel="FF India Apk admin"
    />
  );
}
