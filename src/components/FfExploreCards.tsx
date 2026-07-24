"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";

/**
 * Point 2 — official-site direction (“Explore Free Fire / Free Fire Max”),
 * but CTAs stay on this website only. Wallpapers are local `/public/ff/*`.
 */
export function FfExploreCards() {
  const pathname = usePathname() ?? "";
  if (pathname !== "/" && pathname !== "") return null;

  return (
    <section className="ff-explore" aria-labelledby="ff-explore-title">
      <h2 id="ff-explore-title" className="ff-explore-title">
        Explore calculators
      </h2>
      <div className="ff-explore-grid">
        <article className="ff-explore-card ff-explore-card--ff">
          <div className="ff-explore-card-media">
            <Image
              src="/ff/wallpaper-1.jpg"
              alt="Free Fire wallpaper"
              fill
              sizes="(max-width: 700px) 95vw, 520px"
            />
          </div>
          <div className="ff-explore-card-body">
            <div className="ff-explore-card-top">
              <span className="ff-explore-icon" aria-hidden>
                <i className="fa-solid fa-fire" />
              </span>
              <h3 className="ff-explore-card-title">Free Fire</h3>
            </div>
            <p className="ff-explore-card-text">
              Classic Free Fire sensitivity for all RAM phones — headshot, DPI, and drag settings.
            </p>
            <ul className="ff-explore-points">
              <li>
                <i className="fa-solid fa-check" aria-hidden /> Low &amp; mid-range friendly
              </li>
              <li>
                <i className="fa-solid fa-check" aria-hidden /> One-tap &amp; drag tuned
              </li>
              <li>
                <i className="fa-solid fa-check" aria-hidden /> Instant calculator on home
              </li>
            </ul>
            <Link className="ff-explore-btn" href="/#ff-calculator">
              Explore Free Fire
              <i className="fa-solid fa-arrow-right" aria-hidden />
            </Link>
          </div>
        </article>

        <article className="ff-explore-card ff-explore-card--max">
          <div className="ff-explore-card-media">
            <Image
              src="/ff/wallpaper-3.jpg"
              alt="Free Fire Max wallpaper"
              fill
              sizes="(max-width: 700px) 95vw, 520px"
            />
          </div>
          <div className="ff-explore-card-body">
            <div className="ff-explore-card-top">
              <span className="ff-explore-icon" aria-hidden>
                <i className="fa-solid fa-fire-flame-curved" />
              </span>
              <h3 className="ff-explore-card-title">Free Fire Max</h3>
            </div>
            <p className="ff-explore-card-text">
              Max-mode sensitivity for heavier graphics — separate tune for smoother aim on stronger
              phones.
            </p>
            <ul className="ff-explore-points">
              <li>
                <i className="fa-solid fa-check" aria-hidden /> Built for FF Max feel
              </li>
              <li>
                <i className="fa-solid fa-check" aria-hidden /> Better on 6GB+ devices
              </li>
              <li>
                <i className="fa-solid fa-check" aria-hidden /> Own Max calculator page
              </li>
            </ul>
            <Link className="ff-explore-btn" href={FREE_FIRE_MAX_PATH}>
              Explore Free Fire Max
              <i className="fa-solid fa-arrow-right" aria-hidden />
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
