import { mapAdminLegalPages } from "@/src/server/admin/mapAdminLegalPages";
import { ensureCoreLegalPages } from "@/src/server/repositories/legalPagesRepository";
import AdminLegalPagesClient from "./AdminLegalPagesClient";

export const dynamic = "force-dynamic";

export default async function AdminLegalPagesPage() {
  const pages = await ensureCoreLegalPages();
  const initialRows = mapAdminLegalPages(pages);
  return <AdminLegalPagesClient initialRows={initialRows} />;
}
