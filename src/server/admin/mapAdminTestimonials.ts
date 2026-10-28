import type { TestimonialRecord } from "@/src/server/repositories/testimonialsRepository";

export type AdminTestimonialItem = {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  game:
    | "bgmi"
    | "bgmi-lite"
    | "pubg"
    | "pubg-mobile-lite"
    | "freefire"
    | "freefire-india"
    | "freefire-max";
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

export function parseAdminTestimonialJson(item: Record<string, unknown>): AdminTestimonialItem {
  const gameRaw = String(item.game ?? "bgmi");
  const game: AdminTestimonialItem["game"] =
    gameRaw === "bgmi-lite" ||
    gameRaw === "pubg" ||
    gameRaw === "pubg-mobile-lite" ||
    gameRaw === "freefire" ||
    gameRaw === "freefire-india" ||
    gameRaw === "freefire-max"
      ? gameRaw
      : "bgmi";
  const statusRaw = String(item.status ?? "pending");
  const status: AdminTestimonialItem["status"] =
    statusRaw === "approved" || statusRaw === "rejected" ? statusRaw : "pending";

  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? "Anonymous"),
    email: item.email ? String(item.email) : "",
    rating: Number(item.rating ?? 0),
    message: String(item.message ?? ""),
    game,
    phoneModel: item.phoneModel ? String(item.phoneModel) : "",
    showName: Boolean(item.showName ?? true),
    status,
    createdAt: item.createdAt ? String(item.createdAt) : "",
    approvedAt: item.approvedAt ? String(item.approvedAt) : "",
  };
}
