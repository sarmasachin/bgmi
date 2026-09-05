import { getBgmiLiteApkPageForAdmin } from "@/src/server/repositories/bgmiLiteApkPageRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { DEFAULT_BGMI_LITE_APK_PAGE } from "@/src/lib/bgmiLiteBetaApkPage";
import AdminBgmiLiteApkClient from "./AdminBgmiLiteApkClient";

export const dynamic = "force-dynamic";

export default async function AdminBgmiLiteApkPage() {
  const access = await requireAdminPageAccess("bgmiLiteApk.view");
  if (!access.ok) return <AdminAccessDenied />;

  let initialData = { page: DEFAULT_BGMI_LITE_APK_PAGE, usingDefault: true };
  try {
    initialData = await getBgmiLiteApkPageForAdmin();
  } catch {
    initialData = { page: DEFAULT_BGMI_LITE_APK_PAGE, usingDefault: true };
  }

  return <AdminBgmiLiteApkClient initialData={initialData} />;
}
