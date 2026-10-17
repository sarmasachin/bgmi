import { mapAdminTestimonials } from "@/src/server/admin/mapAdminTestimonials";
import {
  listAdminTestimonials,
  MAX_APPROVED_TESTIMONIALS,
} from "@/src/server/repositories/testimonialsRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminTestimonialsClient from "./AdminTestimonialsClient";

export default async function AdminTestimonialsPage() {
  const access = await requireAdminPageAccess("testimonials.view");
  if (!access.ok) return <AdminAccessDenied />;

  const items = await listAdminTestimonials();

  return (
    <AdminTestimonialsClient
      initialItems={mapAdminTestimonials(items)}
      maxApproved={MAX_APPROVED_TESTIMONIALS}
    />
  );
}
