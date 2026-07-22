import { notFound, redirect } from "next/navigation";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import { getAdminRoleDefinitionById } from "@/src/server/repositories/adminRolesRepository";
import AdminRoleEditClient from "./AdminRoleEditClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AdminRoleEditPage({ params }: Props) {
  const access = await requireAdminPageAccess("users.manage");
  if (!access.ok) return <AdminAccessDenied />;

  const { id } = await params;
  const role = await getAdminRoleDefinitionById(id);
  if (!role) notFound();
  if (role.name === "superadmin") redirect("/admin/roles");

  return <AdminRoleEditClient initialRole={role} />;
}
