import { getPubgMobileLiteRedeemPageForAdmin } from "@/src/server/repositories/pubgMobileLiteRedeemCodesRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminPubgMobileLiteRedeemClient from "./AdminPubgMobileLiteRedeemClient";

export const dynamic = "force-dynamic";

export default async function AdminPubgMobileLiteRedeemPage() {
  const access = await requireAdminPageAccess("pubgMobileLiteRedeem.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = await getPubgMobileLiteRedeemPageForAdmin();
  return <AdminPubgMobileLiteRedeemClient initialData={initialData} />;
}
