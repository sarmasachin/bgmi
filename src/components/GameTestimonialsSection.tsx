"use client";

import { usePathname } from "next/navigation";
import { TestimonialForm } from "@/src/components/TestimonialForm";
import { TestimonialsMarquee } from "@/src/components/TestimonialsMarquee";
import type { PublicTestimonial } from "@/src/server/repositories/testimonialsRepository";

type Props = {
  bgmiTestimonials?: PublicTestimonial[];
  pubgTestimonials?: PublicTestimonial[];
  freefireTestimonials?: PublicTestimonial[];
};

export function GameTestimonialsSection({
  bgmiTestimonials,
  pubgTestimonials,
  freefireTestimonials,
}: Props) {
  const pathname = usePathname() ?? "";
  const game =
    pathname === "/" || pathname === ""
      ? "freefire"
      : pathname === "/pubg" || pathname.startsWith("/pubg/")
        ? "pubg"
        : "bgmi";
  const initialItems =
    game === "freefire"
      ? freefireTestimonials
      : game === "pubg"
        ? pubgTestimonials
        : bgmiTestimonials;

  return (
    <>
      <TestimonialsMarquee key={`marquee-${game}`} game={game} initialItems={initialItems} />
      <TestimonialForm key={`form-${game}`} game={game} />
    </>
  );
}
