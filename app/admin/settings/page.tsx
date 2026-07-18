import { prefetchAdminSettingsPageData } from "@/src/server/admin/prefetchAdminSettingsPageData";
import AdminSettingsClient from "./AdminSettingsClient";

export default async function AdminSettingsPage() {
  const initialData = await prefetchAdminSettingsPageData();
  return <AdminSettingsClient initialData={initialData} />;
}
