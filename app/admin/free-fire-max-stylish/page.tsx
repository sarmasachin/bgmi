import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { FREE_FIRE_MAX_STYLISH_NAME_PATH } from "@/src/lib/freeFireMaxStylishNamePage";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { getFreeFireMaxStylishNamePageForAdmin } from "@/src/server/repositories/freeFireMaxStylishNameRepository";
import AdminFreeFireStylishClient from "../free-fire-stylish/AdminFreeFireStylishClient";

export const dynamic = "force-dynamic";

export default async function AdminFreeFireMaxStylishPage() {
  const access = await requireAdminPageAccess("freeFireMaxStylish.view");
  if (!access.ok) return <AdminAccessDenied />;

  const initialData = await getFreeFireMaxStylishNamePageForAdmin();
  return (
    <AdminFreeFireStylishClient
      initialData={initialData}
      apiPath="/api/admin/free-fire-max-stylish"
      previewPath={FREE_FIRE_MAX_STYLISH_NAME_PATH}
      heading="Free Fire Max Stylish Name"
      savedPathLabel="/free-fire-max-stylish-name"
      pathLockedLabel="/free-fire-max-stylish-name"
      saveSuccessMessage="Free Fire Max stylish name page saved."
      resetSuccessMessage="Reverted to built-in Free Fire Max name defaults."
      boundaryLabel="Free Fire Max Stylish Name admin"
    />
  );
}
