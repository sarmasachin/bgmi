import { getFreeFireRedeemPageForAdmin } from "@/src/server/repositories/freeFireRedeemCodesRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminFreeFireRedeemClient from "./AdminFreeFireRedeemClient";

export const dynamic = "force-dynamic";

export default async function AdminFreeFireRedeemPage() {
  const access = await requireAdminPageAccess("freeFireRedeem.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = await getFreeFireRedeemPageForAdmin();
  return <AdminFreeFireRedeemClient initialData={initialData} />;
}
