import { getBgmiRedeemPageForAdmin } from "@/src/server/repositories/bgmiRedeemCodesRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminBgmiRedeemClient from "./AdminBgmiRedeemClient";

export const dynamic = "force-dynamic";

export default async function AdminBgmiRedeemPage() {
  const access = await requireAdminPageAccess("bgmiRedeem.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = await getBgmiRedeemPageForAdmin();
  return <AdminBgmiRedeemClient initialData={initialData} />;
}
