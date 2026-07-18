import { prefetchAdminMediaPageData } from "@/src/server/admin/prefetchAdminMediaPageData";
import AdminMediaClient from "./AdminMediaClient";

export default async function AdminMediaPage() {
  const { initialFiles, initialOutputPref } = await prefetchAdminMediaPageData();
  return <AdminMediaClient initialFiles={initialFiles} initialOutputPref={initialOutputPref} />;
}
