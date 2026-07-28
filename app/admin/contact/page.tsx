import { mapAdminContactMessages } from "@/src/server/admin/mapAdminContactMessages";
import { getContactSeo } from "@/src/server/repositories/listingSeoRepository";
import { listContactMessages } from "@/src/server/repositories/contactRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminContactClient from "./AdminContactClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminContactPage() {
  const access = await requireAdminPageAccess("contact.view");
  if (!access.ok) return <AdminAccessDenied />;

  const [rows, seo] = await Promise.all([listContactMessages(), getContactSeo()]);
  const initialItems = mapAdminContactMessages(rows);
  return <AdminContactClient initialItems={initialItems} initialSeo={seo} />;
}
