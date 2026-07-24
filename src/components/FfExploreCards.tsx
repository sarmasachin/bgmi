"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";

/**
 * Explore calculators — home & Max share layout; Max page copy is Max-first.
 */
export function FfExploreCards() {
  const pathname = usePathname() ?? "";
  const isHome = pathname === "/" || pathname === "";
  const isMax = pathname === FREE_FIRE_MAX_PATH;
  if (!isHome && !isMax) return null;

  const maxHref = isMax
    ? `${FREE_FIRE_MAX_PATH}#ff-calculator`
    : FREE_FIRE_MAX_PATH;

  return (
    <section className="ff-explore" aria-labelledby="ff-explore-title">
      <h2 id="ff-explore-title" className="ff-explore-title">
        {isMax ? "Switch between Max & Free Fire" : "Explore calculators"}
      </h2>
      <div className="ff-explore-grid">
        <article className="ff-explore-card ff-explore-card--ff">
          <div className="ff-explore-card-top">
            <span className="ff-explore-icon" aria-hidden>
              <i className="fa-solid fa-fire" />
            </span>
            <h3 className="ff-explore-card-title">Free Fire</h3>
          </div>
          <p className="ff-explore-card-text">
            {isMax
              ? "Lighter classic Free Fire — better when you want max FPS on a budget phone."
              : "Classic Free Fire sensitivity for all RAM phones — headshot, DPI, and drag settings."}
          </p>
          <ul className="ff-explore-points">
            {isMax ? (
              <>
                <li>
                  <i className="fa-solid fa-check" aria-hidden /> Cooler phone, smoother FPS
                </li>
                <li>
                  <i className="fa-solid fa-check" aria-hidden /> Separate classic sensi tool
                </li>
                <li>
                  <i className="fa-solid fa-check" aria-hidden /> Same account via Firelink
                </li>
              </>
            ) : (
              <>
                <li>
                  <i className="fa-solid fa-check" aria-hidden /> Low &amp; mid-range friendly
                </li>
                <li>
                  <i className="fa-solid fa-check" aria-hidden /> One-tap &amp; drag tuned
                </li>
                <li>
                  <i className="fa-solid fa-check" aria-hidden /> Instant calculator on home
                </li>
              </>
            )}
          </ul>
          <Link className="ff-explore-btn" href="/#ff-calculator">
            {isMax ? "Open Free Fire calculator" : "Explore Free Fire"}
            <i className="fa-solid fa-arrow-right" aria-hidden />
          </Link>
        </article>

        <article className="ff-explore-card ff-explore-card--max">
          <div className="ff-explore-card-top">
            <span className="ff-explore-icon" aria-hidden>
              <i className="fa-solid fa-fire-flame-curved" />
            </span>
            <h3 className="ff-explore-card-title">Free Fire Max</h3>
          </div>
          <p className="ff-explore-card-text">
            {isMax
              ? "You’re on the Max tool — built for heavier graphics so aim doesn’t feel sticky or too floaty."
              : "Max-mode sensitivity for heavier graphics — separate tune for smoother aim on stronger phones."}
          </p>
          <ul className="ff-explore-points">
            {isMax ? (
              <>
                <li>
                  <i className="fa-solid fa-check" aria-hidden /> Tuned for Max feel, not FF codes
                </li>
                <li>
                  <i className="fa-solid fa-check" aria-hidden /> Works best on 6GB+ phones
                </li>
                <li>
                  <i className="fa-solid fa-check" aria-hidden /> Scroll up to recalculate anytime
                </li>
              </>
            ) : (
              <>
                <li>
                  <i className="fa-solid fa-check" aria-hidden /> Built for FF Max feel
                </li>
                <li>
                  <i className="fa-solid fa-check" aria-hidden /> Better on 6GB+ devices
                </li>
                <li>
                  <i className="fa-solid fa-check" aria-hidden /> Own Max calculator page
                </li>
              </>
            )}
          </ul>
          <Link className="ff-explore-btn" href={maxHref}>
            {isMax ? "Back to Max calculator" : "Explore Free Fire Max"}
            <i className="fa-solid fa-arrow-right" aria-hidden />
          </Link>
        </article>
      </div>
    </section>
  );
}
