import { getAdminAuditRows } from "@/src/server/repositories/adminAuditRepository";
import AdminAuditClient from "./AdminAuditClient";

export default async function AdminAuditPage() {
  const initialRows = await getAdminAuditRows();
  return <AdminAuditClient initialRows={initialRows} />;
}
