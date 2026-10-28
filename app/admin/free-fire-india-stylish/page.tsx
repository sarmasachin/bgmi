import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { FREE_FIRE_INDIA_STYLISH_NAME_PATH } from "@/src/lib/freeFireIndiaNamePage";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { getFreeFireIndiaStylishNamePageForAdmin } from "@/src/server/repositories/freeFireIndiaStylishNameRepository";
import AdminFreeFireStylishClient from "../free-fire-stylish/AdminFreeFireStylishClient";

export const dynamic = "force-dynamic";

export default async function AdminFreeFireIndiaStylishPage() {
  const access = await requireAdminPageAccess("freeFireIndiaStylish.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = await getFreeFireIndiaStylishNamePageForAdmin();
  return (
    <AdminFreeFireStylishClient
      initialData={initialData}
      apiPath="/api/admin/free-fire-india-stylish"
      previewPath={FREE_FIRE_INDIA_STYLISH_NAME_PATH}
      heading="Free Fire India Stylish Name"
      savedPathLabel="/free-fire-india-stylish-name"
      pathLockedLabel="/free-fire-india-stylish-name"
      saveSuccessMessage="Free Fire India stylish name page saved."
      boundaryLabel="Free Fire India Stylish Name admin"
    />
  );
}
