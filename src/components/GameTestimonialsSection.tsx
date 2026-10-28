"use client";

import { usePathname } from "next/navigation";
import { TestimonialForm } from "@/src/components/TestimonialForm";
import { TestimonialsMarquee } from "@/src/components/TestimonialsMarquee";
import { isBgmiLitePath, isFreeFireIndiaPath, isHomeFfPath, isPubgMobileLitePath } from "@/src/lib/gamePagePath";
import type { PublicTestimonial } from "@/src/server/repositories/testimonialsRepository";

type Props = {
  bgmiTestimonials?: PublicTestimonial[];
  bgmiLiteTestimonials?: PublicTestimonial[];
  pubgTestimonials?: PublicTestimonial[];
  pubgMobileLiteTestimonials?: PublicTestimonial[];
  freefireTestimonials?: PublicTestimonial[];
  freefireIndiaTestimonials?: PublicTestimonial[];
};

export function GameTestimonialsSection({
  bgmiTestimonials,
  bgmiLiteTestimonials,
  pubgTestimonials,
  pubgMobileLiteTestimonials,
  freefireTestimonials,
  freefireIndiaTestimonials,
}: Props) {
  const pathname = usePathname() ?? "";
  const game =
    isFreeFireIndiaPath(pathname)
      ? "freefire-india"
      : isHomeFfPath(pathname)
        ? "freefire"
        : isPubgMobileLitePath(pathname)
        ? "pubg-mobile-lite"
        : pathname === "/pubg" || pathname.startsWith("/pubg/")
          ? "pubg"
          : isBgmiLitePath(pathname)
            ? "bgmi-lite"
            : "bgmi";

  const initialItems =
    game === "freefire-india"
      ? freefireIndiaTestimonials
      : game === "freefire"
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
