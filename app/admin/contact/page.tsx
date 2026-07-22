import { mapAdminContactMessages } from "@/src/server/admin/mapAdminContactMessages";
import { listContactMessages } from "@/src/server/repositories/contactRepository";
import AdminContactClient from "./AdminContactClient";

export default async function AdminContactPage() {
  let initialItems: ReturnType<typeof mapAdminContactMessages> = [];
  try {
    const items = await listContactMessages();
    initialItems = mapAdminContactMessages(items);
  } catch (error) {
    console.error("[admin/contact] page list failed:", error);
  }
  return <AdminContactClient initialItems={initialItems} />;
}
