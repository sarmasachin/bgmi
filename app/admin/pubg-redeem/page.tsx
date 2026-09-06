import { getPubgRedeemPageForAdmin } from "@/src/server/repositories/pubgRedeemCodesRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { clonePubgRedeemPage } from "@/src/lib/pubgRedeemCodes";
import AdminPubgRedeemClient from "./AdminPubgRedeemClient";

export const dynamic = "force-dynamic";

export default async function AdminPubgRedeemPage() {
  const access = await requireAdminPageAccess("pubgRedeem.view");
  if (!access.ok) return <AdminAccessDenied />;

  let initialData = { page: clonePubgRedeemPage(), usingDefault: true };
  try {
    initialData = await getPubgRedeemPageForAdmin();
  } catch {
    initialData = { page: clonePubgRedeemPage(), usingDefault: true };
  }

  return <AdminPubgRedeemClient initialData={initialData} />;
}
