import { mapAdminTestimonials } from "@/src/server/admin/mapAdminTestimonials";
import {
  countApprovedTestimonials,
  listAdminTestimonials,
  MAX_APPROVED_TESTIMONIALS,
} from "@/src/server/repositories/testimonialsRepository";
import { requireAdminPageAccess } from "@/src/server/rbac/requireAdminPage";
import { AdminAccessDenied } from "@/src/components/admin/AdminAccessDenied";
import AdminTestimonialsClient from "./AdminTestimonialsClient";

export default async function AdminTestimonialsPage() {
  const access = await requireAdminPageAccess("testimonials.view");
  if (!access.ok) return <AdminAccessDenied />;

  const [items, approvedCount] = await Promise.all([
    listAdminTestimonials(),
    countApprovedTestimonials(),
  ]);

  return (
    <AdminTestimonialsClient
      initialItems={mapAdminTestimonials(items)}
      initialApprovedCount={approvedCount ?? 0}
      maxApproved={MAX_APPROVED_TESTIMONIALS}
    />
  );
}
