"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

type Variant = "freefire" | "freefire-max";

const COPY: Record<
  Variant,
  { src: string; alt: string; eyebrow: string; title: string; text: string }
> = {
  freefire: {
    src: "/ff/hero-banner.png",
    alt: "Free Fire wallpaper art for sensitivity settings",
    eyebrow: "Free Fire",
    title: "Headshot-ready sensitivity",
    text: "Phone-matched Free Fire settings — hosted on Sensitivity Settings only.",
  },
  "freefire-max": {
    src: "/ff/wallpaper-2.jpg",
    alt: "Free Fire Max wallpaper art for sensitivity settings",
    eyebrow: "Free Fire Max",
    title: "Max graphics. Cleaner aim.",
    text: "Dedicated Free Fire Max sensitivity for smoother flicks on stronger devices.",
  },
};

/**
 * Visual FF / FF Max hero. Images are local `/public/ff/*` only — no third-party links.
 * Home variant hides itself on /bgmi and /pubg (shared games layout).
 */
export function FfHeroBanner({ variant }: { variant: Variant }) {
  const pathname = usePathname() ?? "";
  if (variant === "freefire" && pathname !== "/" && pathname !== "") return null;

  const copy = COPY[variant];

  return (
    <section className="ff-hero" aria-label={`${copy.eyebrow} highlight`}>
      <div className="ff-hero-frame">
        <Image
          src={copy.src}
          alt={copy.alt}
          fill
          priority={variant === "freefire"}
          sizes="(max-width: 900px) 100vw, 1100px"
          className="ff-hero-img"
        />
        <div className="ff-hero-shade" aria-hidden />
        <div className="ff-hero-copy">
          <p className="ff-hero-eyebrow">{copy.eyebrow}</p>
          <h2 className="ff-hero-title">{copy.title}</h2>
          <p className="ff-hero-text">{copy.text}</p>
        </div>
      </div>
    </section>
  );
}
