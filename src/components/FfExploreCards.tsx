"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import {
  isHomeFfPath,
  isLiteCalculatorPath,
  pickLitePageContent,
} from "@/src/lib/gamePagePath";
import type { FfHomeExplore } from "@/src/lib/homeCardsTypes";

type Props = {
  homeContent?: FfHomeExplore;
  liteContent?: FfHomeExplore;
  pubgLiteContent?: FfHomeExplore;
};

/**
 * Explore cards — Free Fire home / Max / Lite calculators.
 */
export function FfExploreCards({ homeContent, liteContent, pubgLiteContent }: Props) {
  const pathname = usePathname() ?? "";
  const isHome = isHomeFfPath(pathname);
  const isMax = pathname === FREE_FIRE_MAX_PATH;
  const isLite = isLiteCalculatorPath(pathname);
  if (!isHome && !isMax && !isLite) return null;

  const content: FfHomeExplore | undefined = isLite
    ? pickLitePageContent(pathname, homeContent, liteContent, pubgLiteContent)
    : homeContent ??
      (isMax
        ? {
            title: "Switch between Max & Free Fire",
            freefire: {
              title: "Free Fire",
              text: "Lighter classic Free Fire — better when you want max FPS on a budget phone.",
              points: [
                "Cooler phone, smoother FPS",
                "Separate classic sensi tool",
                "Same account via Firelink",
              ],
              buttonLabel: "Open Free Fire calculator",
              href: "/#ff-calculator",
            },
            freefireMax: {
              title: "Free Fire Max",
              text: "You’re on the Max tool — built for heavier graphics so aim doesn’t feel sticky or too floaty.",
              points: [
                "Tuned for Max feel, not FF codes",
                "Works best on 6GB+ phones",
                "Scroll up to recalculate anytime",
              ],
              buttonLabel: "Back to Max calculator",
              href: `${FREE_FIRE_MAX_PATH}#ff-calculator`,
            },
          }
        : {
            title: "Explore calculators",
            freefire: {
              title: "Free Fire",
              text: "Classic Free Fire sensitivity for all RAM phones — DPI and drag-friendly presets.",
              points: [
                "Low & mid-range friendly",
                "Drag-friendly presets",
                "Instant calculator on home",
              ],
              buttonLabel: "Explore Free Fire",
              href: "/#ff-calculator",
            },
            freefireMax: {
              title: "Free Fire Max",
              text: "Max-mode sensitivity for heavier graphics — separate tune for smoother aim on stronger phones.",
              points: [
                "Built for FF Max feel",
                "Better on 6GB+ devices",
                "Own Max calculator page",
              ],
              buttonLabel: "Explore Free Fire Max",
              href: FREE_FIRE_MAX_PATH,
            },
          });

  if (!content) return null;

  const icons = isLite
    ? (["fa-mobile-screen", "fa-download"] as const)
    : (["fa-fire", "fa-fire-flame-curved"] as const);

  return (
    <section className="ff-explore" aria-labelledby="ff-explore-title">
      <h2 id="ff-explore-title" className="ff-explore-title">
        {content.title}
      </h2>
      <div className="ff-explore-grid">
        {([content.freefire, content.freefireMax] as const).map((card, index) => (
          <article
            key={card.title}
            className={`ff-explore-card ${index === 0 ? "ff-explore-card--ff" : "ff-explore-card--max"}`}
          >
            <div className="ff-explore-card-top">
              <span className="ff-explore-icon" aria-hidden>
                <i className={`fa-solid ${icons[index]}`} />
              </span>
              <h3 className="ff-explore-card-title">{card.title}</h3>
            </div>
            <p className="ff-explore-card-text">{card.text}</p>
            <ul className="ff-explore-points">
              {card.points.map((point) => (
                <li key={point}>
                  <i className="fa-solid fa-check" aria-hidden /> {point}
                </li>
              ))}
            </ul>
            <Link className="ff-explore-btn" href={card.href}>
              {card.buttonLabel}
              <i
                className={`fa-solid ${index === 0 ? "fa-arrow-up" : "fa-arrow-right"}`}
                aria-hidden
              />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
