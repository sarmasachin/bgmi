import { mapAdminPageRows } from "@/src/server/admin/mapAdminPageRows";
import { listPages } from "@/src/server/repositories/pagesRepository";
import AdminPagesClient from "./AdminPagesClient";

export default async function AdminPagesPage() {
  const pages = await listPages();
  const initialRows = mapAdminPageRows(pages);
  return <AdminPagesClient initialRows={initialRows} />;
}
