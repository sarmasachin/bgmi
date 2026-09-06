import { getPubgApkPageForAdmin } from "@/src/server/repositories/pubgApkPageRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { DEFAULT_PUBG_APK_PAGE } from "@/src/lib/pubgApkPage";
import AdminPubgApkClient from "./AdminPubgApkClient";

export const dynamic = "force-dynamic";

export default async function AdminPubgApkPage() {
  const access = await requireAdminPageAccess("pubgApk.view");
  if (!access.ok) return <AdminAccessDenied />;

  let initialData = { page: DEFAULT_PUBG_APK_PAGE, usingDefault: true };
  try {
    initialData = await getPubgApkPageForAdmin();
  } catch {
    initialData = { page: DEFAULT_PUBG_APK_PAGE, usingDefault: true };
  }

  return <AdminPubgApkClient initialData={initialData} />;
}
