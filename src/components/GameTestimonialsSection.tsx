"use client";

import { usePathname } from "next/navigation";
import { TestimonialForm } from "@/src/components/TestimonialForm";
import { TestimonialsMarquee } from "@/src/components/TestimonialsMarquee";
import { isBgmiLitePath, isPubgMobileLitePath } from "@/src/lib/gamePagePath";
import type { PublicTestimonial } from "@/src/server/repositories/testimonialsRepository";

type Props = {
  bgmiTestimonials?: PublicTestimonial[];
  bgmiLiteTestimonials?: PublicTestimonial[];
  pubgTestimonials?: PublicTestimonial[];
  pubgMobileLiteTestimonials?: PublicTestimonial[];
  freefireTestimonials?: PublicTestimonial[];
};

export function GameTestimonialsSection({
  bgmiTestimonials,
  bgmiLiteTestimonials,
  pubgTestimonials,
  pubgMobileLiteTestimonials,
  freefireTestimonials,
}: Props) {
  const pathname = usePathname() ?? "";
  const game =
    pathname === "/" || pathname === ""
      ? "freefire"
      : isPubgMobileLitePath(pathname)
        ? "pubg-mobile-lite"
        : pathname === "/pubg" || pathname.startsWith("/pubg/")
          ? "pubg"
          : isBgmiLitePath(pathname)
            ? "bgmi-lite"
            : "bgmi";

  const initialItems =
    game === "freefire"
      ? freefireTestimonials
      : game === "pubg-mobile-lite"
        ? pubgMobileLiteTestimonials
        : game === "pubg"
          ? pubgTestimonials
          : game === "bgmi-lite"
            ? bgmiLiteTestimonials
            : bgmiTestimonials;

  return (
    <>
      <TestimonialsMarquee key={`marquee-${game}`} game={game} initialItems={initialItems} />
      <TestimonialForm key={`form-${game}`} game={game} />
    </>
  );
}
