import type { TestimonialRecord } from "@/src/server/repositories/testimonialsTypes";
import { MAX_APPROVED_TESTIMONIALS } from "@/src/server/repositories/testimonialsTypes";

/** In-memory rows when Postgres is down (dev only). */
export const mockTestimonials: TestimonialRecord[] = buildDummyMockTestimonials();

function buildDummyMockTestimonials(): TestimonialRecord[] {
  if (process.env.NODE_ENV === "production") return [];
  if (process.env.DISABLE_DUMMY_TESTIMONIALS === "1") return [];
  const now = new Date();
  const count = Math.min(5, Math.max(1, Number(process.env.DUMMY_TESTIMONIAL_COUNT || "2") || 2));
  const pool: Omit<TestimonialRecord, "id" | "createdAt" | "approvedAt" | "status" | "game">[] = [
    {
      name: "Pranjal Thakur",
      email: "pranjal.dummy@example.com",
      rating: 5,
      message: "Best Calculator 💯 working",
      phoneModel: "Poco X6",
      showName: true,
    },
    {
      name: "akrambarodi404@gmail.com",
      email: "akrambarodi404@gmail.com",
      rating: 5,
      message: "اريد حساسية خارقة فقط احمر وسريع ومكتملة فقط احر",
      phoneModel: null,
      showName: true,
    },
    {
      name: "Rahul Sharma",
      email: "rahul.dummy@example.com",
      rating: 5,
      message: "Sensi presets work well on my Redmi phone. Thanks!",
      phoneModel: "Redmi Note 13",
      showName: true,
    },
    {
      name: "Ayesha Khan",
      email: "ayesha.dummy@example.com",
      rating: 4,
      message: "Easy to use Free Fire calculator. Drag feel is good.",
      phoneModel: "iPhone 13",
      showName: true,
    },
    {
      name: "Vikram",
      email: "vikram.dummy@example.com",
      rating: 5,
      message: "Finally proper settings for 90 FPS. Working well.",
      phoneModel: "IQOO Neo 9",
      showName: true,
    },
  ];
  return pool.slice(0, count).map((item, index) => ({
    ...item,
    id: `dummy-ff-${index + 1}`,
    game: "freefire",
    status: "approved",
    createdAt: now,
    approvedAt: now,
  }));
}

export function trimApprovedOverflowMock() {
  const approved = mockTestimonials
    .filter((row) => row.status === "approved")
    .sort((a, b) => {
      const aTime = (a.approvedAt ?? a.createdAt).getTime();
      const bTime = (b.approvedAt ?? b.createdAt).getTime();
      return aTime - bTime;
    });
  if (approved.length <= MAX_APPROVED_TESTIMONIALS) return 0;
  const excess = approved.length - MAX_APPROVED_TESTIMONIALS;
  const removeIds = new Set(approved.slice(0, excess).map((row) => row.id));
  for (let i = mockTestimonials.length - 1; i >= 0; i--) {
    if (removeIds.has(mockTestimonials[i].id)) {
      mockTestimonials.splice(i, 1);
    }
  }
  return excess;
}
