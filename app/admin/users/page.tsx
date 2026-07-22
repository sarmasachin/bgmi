import { listAdminUsers } from "@/src/server/repositories/adminUsersRepository";
import AdminUsersClient from "./AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const initialRows = await listAdminUsers();
  return <AdminUsersClient initialRows={initialRows} />;
}
