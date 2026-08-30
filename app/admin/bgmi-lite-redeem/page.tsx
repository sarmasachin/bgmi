import { getBgmiLiteRedeemPageForAdmin } from "@/src/server/repositories/bgmiLiteRedeemCodesRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminBgmiLiteRedeemClient from "./AdminBgmiLiteRedeemClient";

export const dynamic = "force-dynamic";

export default async function AdminBgmiLiteRedeemPage() {
  const access = await requireAdminPageAccess("bgmiLiteRedeem.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = await getBgmiLiteRedeemPageForAdmin();
  return <AdminBgmiLiteRedeemClient initialData={initialData} />;
}
