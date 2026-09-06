/** Hard cap for publicly shown / approved testimonials (FIFO on approve). */
export const MAX_APPROVED_TESTIMONIALS = 20;

export type TestimonialGame =
  | "bgmi"
  | "bgmi-lite"
  | "pubg"
  | "pubg-mobile-lite"
  | "freefire"
  | "freefire-max";
export type TestimonialStatus = "pending" | "approved" | "rejected";

export type TestimonialRecord = {
  id: string;
  name: string;
  email: string | null;
  rating: number;
  message: string;
  game: TestimonialGame;
  phoneModel: string | null;
  showName: boolean;
  status: TestimonialStatus;
  createdAt: Date;
  approvedAt: Date | null;
};

export type CreateTestimonialInput = {
  name: string;
  email?: string | null;
  rating: number;
  message: string;
  game: TestimonialGame;
  phoneModel?: string | null;
  showName: boolean;
};

/** Public-safe shape (never exposes rejected/pending). */
export type PublicTestimonial = {
  id: string;
  name: string;
  rating: number;
  message: string;
  game: TestimonialGame;
  phoneModel: string | null;
  createdAt: string;
};
