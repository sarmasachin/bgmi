import { getBgmiApkPageForAdmin } from "@/src/server/repositories/bgmiApkPageRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { DEFAULT_BGMI_APK_PAGE } from "@/src/lib/bgmiApkPage";
import AdminBgmiApkClient from "./AdminBgmiApkClient";

export const dynamic = "force-dynamic";

export default async function AdminBgmiApkPage() {
  const access = await requireAdminPageAccess("bgmiApk.view");
  if (!access.ok) return <AdminAccessDenied />;

  let initialData = { page: DEFAULT_BGMI_APK_PAGE, usingDefault: true };
  try {
    initialData = await getBgmiApkPageForAdmin();
  } catch {
    initialData = { page: DEFAULT_BGMI_APK_PAGE, usingDefault: true };
  }

  return <AdminBgmiApkClient initialData={initialData} />;
}
