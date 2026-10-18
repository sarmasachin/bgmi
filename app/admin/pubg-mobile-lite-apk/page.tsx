import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { DEFAULT_PUBG_MOBILE_LITE_APK_PAGE } from "@/src/lib/pubgMobileLiteApkPage";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { getPubgMobileLiteApkPageForAdmin } from "@/src/server/repositories/pubgMobileLiteApkPageRepository";
import AdminPubgMobileLiteApkClient from "./AdminPubgMobileLiteApkClient";

export const dynamic = "force-dynamic";

export default async function AdminPubgMobileLiteApkPage() {
  const access = await requireAdminPageAccess("pubgApk.view");
  if (!access.ok) return <AdminAccessDenied />;

  let initialData = { page: DEFAULT_PUBG_MOBILE_LITE_APK_PAGE, usingDefault: true };
  try {
    initialData = await getPubgMobileLiteApkPageForAdmin();
  } catch {
    initialData = { page: DEFAULT_PUBG_MOBILE_LITE_APK_PAGE, usingDefault: true };
  }

  return <AdminPubgMobileLiteApkClient initialData={initialData} />;
}
