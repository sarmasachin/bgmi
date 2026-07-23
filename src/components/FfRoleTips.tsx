"use client";

import { usePathname } from "next/navigation";
import type { CalcInputs } from "@/src/features/ffCalculator/calculator";
import { FF_SET_ROLE_EVENT } from "@/src/lib/ffPlayModes";

type RoleTip = {
  role: CalcInputs["role"];
  title: string;
  icon: string;
  tips: string[];
};

const ROLE_TIPS: RoleTip[] = [
  {
    role: "rusher",
    title: "Rusher tips",
    icon: "fa-person-running",
    tips: [
      "Keep General & Red Dot a bit higher for fast close fights",
      "Use 2–3 finger claw for quicker drag headshots",
      "Practice SMG / shotgun sprays in Training Ground first",
    ],
  },
  {
    role: "sniper",
    title: "Sniper tips",
    icon: "fa-crosshairs",
    tips: [
      "Keep scope values slightly lower for stable tracking",
      "Fine-tune 2x / 4x before sniper scope",
      "Hold angles and adjust Free Look for better peek aim",
    ],
  },
];

/**
 * Point 4 — light role tips (official “choose your style” direction).
 * Safe: own copy only; CTA sets calculator role + scrolls up to tool.
 */
export function FfRoleTips() {
  const pathname = usePathname() ?? "";
  if (pathname !== "/" && pathname !== "") return null;

  function applyRole(role: CalcInputs["role"]) {
    window.dispatchEvent(
      new CustomEvent(FF_SET_ROLE_EVENT, {
        detail: { role, modeId: role },
      }),
    );
    document.getElementById("ff-calculator")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    const roleSelect = document.getElementById("ffc-role") as HTMLSelectElement | null;
    roleSelect?.focus({ preventScroll: true });
  }

  return (
    <section className="ff-role-tips" aria-labelledby="ff-role-tips-title">
<h2 id="ff-role-tips-title" className="ff-role-tips-title">
        Best sensi tips by role
      </h2>
      <div className="ff-role-tips-grid">
        {ROLE_TIPS.map((card) => (
          <article key={card.role} className="ff-role-tip-card">
            <div className="ff-role-tip-head">
              <span className="ff-role-tip-icon" aria-hidden>
                <i className={`fa-solid ${card.icon}`} />
              </span>
              <h3 className="ff-role-tip-name">{card.title}</h3>
            </div>
            <ul className="ff-role-tip-list">
              {card.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            <button
              type="button"
              className="ff-role-tip-btn"
              onClick={() => applyRole(card.role)}
            >
              Use {card.role === "rusher" ? "Rusher" : "Sniper"} in calculator
              <i className="fa-solid fa-arrow-up" aria-hidden />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
