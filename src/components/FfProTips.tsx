"use client";

import { usePathname } from "next/navigation";

type ProTip = {
  id: string;
  title: string;
  tip: string;
  icon: string;
};

/**
 * Point 6 — official-site “Esports / pro tip” direction (FFWS vibe),
 * without logos, team names, or external esports links.
 */
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

export function FfProTips() {
  const pathname = usePathname() ?? "";
  if (pathname !== "/" && pathname !== "") return null;

  function goToCalculator() {
    document.getElementById("ff-calculator")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section className="ff-pro-tips" aria-labelledby="ff-pro-tips-title">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <h2 id="ff-pro-tips-title" className="ff-pro-tips-title">
        Pro tips for better aim
      </h2>
      <p className="ff-pro-tips-lead">
        Practice-first habits that help any sensi stick — no team logos, just usable advice.
      </p>
      <div className="ff-pro-tips-grid">
        {PRO_TIPS.map((card) => (
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
        Apply sensi in calculator
        <i className="fa-solid fa-arrow-up" aria-hidden />
      </button>
    </section>
  );
}
