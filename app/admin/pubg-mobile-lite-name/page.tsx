import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { getPubgMobileLiteNamePageForAdmin } from "@/src/server/repositories/pubgMobileLiteNameRepository";
import AdminPubgMobileLiteNameClient from "./AdminPubgMobileLiteNameClient";

export const dynamic = "force-dynamic";

export default async function AdminPubgMobileLiteNamePage() {
  const access = await requireAdminPageAccess("pubgMobileLiteName.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = await getPubgMobileLiteNamePageForAdmin();
  return <AdminPubgMobileLiteNameClient initialData={initialData} />;
}
