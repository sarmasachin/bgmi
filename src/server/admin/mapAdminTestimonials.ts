import type { TestimonialRecord } from "@/src/server/repositories/testimonialsRepository";

export type AdminTestimonialItem = {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  game: "bgmi" | "pubg" | "freefire" | "freefire-max";
  phoneModel: string;
  showName: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt: string;
};

export function mapAdminTestimonials(items: TestimonialRecord[]): AdminTestimonialItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email ?? "",
    rating: item.rating,
    message: item.message,
    game: item.game,
    phoneModel: item.phoneModel ?? "",
    showName: item.showName,
    status: item.status,
    createdAt: item.createdAt.toISOString(),
    approvedAt: item.approvedAt ? item.approvedAt.toISOString() : "",
  }));
}
