import { getFreeFireMaxRedeemPageForAdmin } from "@/src/server/repositories/freeFireMaxRedeemCodesRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { FREE_FIRE_MAX_REDEEM_CODE_PATH } from "@/src/lib/freeFireMaxRedeemCodes";
import AdminFreeFireRedeemClient from "../free-fire-redeem/AdminFreeFireRedeemClient";

export const dynamic = "force-dynamic";

export default async function AdminFreeFireMaxRedeemPage() {
  const access = await requireAdminPageAccess("freeFireMaxRedeem.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = await getFreeFireMaxRedeemPageForAdmin();
  return (
    <AdminFreeFireRedeemClient
      initialData={initialData}
      apiPath="/api/admin/free-fire-max-redeem"
      previewPath={FREE_FIRE_MAX_REDEEM_CODE_PATH}
      heading="Free Fire Max Redeem Codes"
      savedPathLabel="/free-fire-max-redeem-code"
      saveSuccessMessage="Free Fire Max redeem codes page saved."
      boundaryLabel="Free Fire Max Redeem admin"
      articleStorageKey="bgmi_admin_ff_max_redeem_article_v1"
    />
  );
}
