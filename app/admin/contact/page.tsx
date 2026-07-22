import { mapAdminContactMessages } from "@/src/server/admin/mapAdminContactMessages";
import { listContactMessages } from "@/src/server/repositories/contactRepository";
import AdminContactClient from "./AdminContactClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminContactPage() {
  const rows = await listContactMessages();
  const initialItems = mapAdminContactMessages(rows);
  return <AdminContactClient initialItems={initialItems} />;
}
