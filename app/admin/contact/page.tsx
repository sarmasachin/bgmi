import { mapAdminContactMessages } from "@/src/server/admin/mapAdminContactMessages";
import { listContactMessages } from "@/src/server/repositories/contactRepository";
import AdminContactClient from "./AdminContactClient";

export default async function AdminContactPage() {
  const items = await listContactMessages();
  const initialItems = mapAdminContactMessages(items);
  return <AdminContactClient initialItems={initialItems} />;
}
