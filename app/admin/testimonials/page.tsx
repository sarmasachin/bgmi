import { mapAdminTestimonials } from "@/src/server/admin/mapAdminTestimonials";
import {
  countApprovedTestimonials,
  listAdminTestimonials,
  MAX_APPROVED_TESTIMONIALS,
} from "@/src/server/repositories/testimonialsRepository";
import AdminTestimonialsClient from "./AdminTestimonialsClient";

export default async function AdminTestimonialsPage() {
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
