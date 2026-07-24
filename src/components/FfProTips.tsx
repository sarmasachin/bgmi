"use client";

import { usePathname } from "next/navigation";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";

type ProTip = {
  id: string;
  title: string;
  tip: string;
  icon: string;
};

const PRO_TIPS: ProTip[] = [
  {
    id: "training",
    title: "Warm up first",
    tip: "Spend 10–15 minutes in Training Ground after applying new sensi — lock muscle memory before ranked.",
    icon: "fa-dumbbell",
  },
  {
    id: "one-change",
    title: "Change one value",
    tip: "Adjust only General or Red Dot first. Big multi-scope edits make it harder to feel what helped.",
    icon: "fa-sliders",
  },
  {
    id: "match-fps",
    title: "Match your FPS",
    tip: "Use the same FPS in the calculator that you play ranked with — mixed FPS feels like bad sensi.",
    icon: "fa-gauge-high",
  },
  {
    id: "record",
    title: "Review your aim",
    tip: "After 2–3 matches, note if drag is too fast or scopes shake — then recalculate with a small tweak.",
    icon: "fa-video",
  },
];

/** Max-only — graphics load / heat / don’t copy classic FF. */
const MAX_PRO_TIPS: ProTip[] = [
  {
    id: "stable-fps",
    title: "Stable FPS beats HD",
    tip: "On Max, a steady frame rate matters more than Ultra looks. If aim feels late, drop effects before changing every slider.",
    icon: "fa-gauge-high",
  },
  {
    id: "dont-copy-ff",
    title: "Don’t paste classic FF codes",
    tip: "Same account, different feel. Max textures and effects make drag heavier — calculate for Max on this page.",
    icon: "fa-ban",
  },
  {
    id: "heat",
    title: "Watch phone heat",
    tip: "Long Max sessions heat mid-range phones. Heat → FPS drop → fake “bad sensi”. Cool down, then retune.",
    icon: "fa-temperature-high",
  },
  {
    id: "one-change-max",
    title: "Change one Max value",
    tip: "Start with General or Red Dot only. After 2 ranked matches, tweak scopes — not everything at once.",
    icon: "fa-sliders",
  },
];

/**
 * Pro tips — home Free Fire copy; Max page Free Fire Max copy.
 */
export function FfProTips() {
  const pathname = usePathname() ?? "";
  const isHome = pathname === "/" || pathname === "";
  const isMax = pathname === FREE_FIRE_MAX_PATH;
  if (!isHome && !isMax) return null;

  const tips = isMax ? MAX_PRO_TIPS : PRO_TIPS;

  function goToCalculator() {
    document.getElementById("ff-calculator")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="ff-pro-tips" aria-labelledby="ff-pro-tips-title">
      <h2 id="ff-pro-tips-title" className="ff-pro-tips-title">
        {isMax ? "Pro tips for Free Fire Max aim" : "Pro tips for better aim"}
      </h2>
      <p className="ff-pro-tips-lead">
        {isMax
          ? "Practical Max habits — graphics, heat, and sensi that actually stick in ranked."
          : "Practice-first habits that help any sensi stick — no team logos, just usable advice."}
      </p>
      <div className="ff-pro-tips-grid">
        {tips.map((card) => (
          <article key={card.id} className="ff-pro-tip-card">
            <span className="ff-pro-tip-icon" aria-hidden>
              <i className={`fa-solid ${card.icon}`} />
            </span>
            <h3 className="ff-pro-tip-name">{card.title}</h3>
            <p className="ff-pro-tip-text">{card.tip}</p>
          </article>
        ))}
      </div>
      <button type="button" className="ff-pro-tips-cta" onClick={goToCalculator}>
        {isMax ? "Apply Max sensi in calculator" : "Apply sensi in calculator"}
        <i className="fa-solid fa-arrow-up" aria-hidden />
      </button>
    </section>
  );
}
