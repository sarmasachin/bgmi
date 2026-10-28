import { getFreeFireIndiaRedeemPageForAdmin } from "@/src/server/repositories/freeFireIndiaRedeemCodesRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { FREE_FIRE_INDIA_REDEEM_CODE_PATH } from "@/src/lib/freeFireIndiaRedeemPage";
import AdminFreeFireRedeemClient from "../free-fire-redeem/AdminFreeFireRedeemClient";

export const dynamic = "force-dynamic";

export default async function AdminFreeFireIndiaRedeemPage() {
  const access = await requireAdminPageAccess("freeFireIndiaRedeem.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = await getFreeFireIndiaRedeemPageForAdmin();
  return (
    <AdminFreeFireRedeemClient
      initialData={initialData}
      apiPath="/api/admin/free-fire-india-redeem"
      previewPath={FREE_FIRE_INDIA_REDEEM_CODE_PATH}
      heading="Free Fire India Redeem Codes"
      savedPathLabel="/free-fire-india-redeem-code"
      saveSuccessMessage="Free Fire India redeem codes page saved."
      boundaryLabel="Free Fire India Redeem admin"
      articleStorageKey="bgmi_admin_ff_india_redeem_article_v1"
    />
  );
}
