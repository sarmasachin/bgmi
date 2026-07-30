"use client";

import { usePathname } from "next/navigation";
import type { CalcInputs } from "@/src/features/ffCalculator/calculator";
import { FF_SET_ROLE_EVENT } from "@/src/lib/ffPlayModes";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import type { FfHomeRoleTips } from "@/src/lib/homeCardsTypes";

type RoleTip = {
  role: CalcInputs["role"];
  title: string;
  icon: string;
  tips: string[];
  buttonLabel?: string;
};

const ROLE_TIPS: RoleTip[] = [
  {
    role: "rusher",
    title: "Rusher tips",
    icon: "fa-person-running",
    tips: [
      "Keep General & Red Dot a bit higher for fast close fights",
      "Use 2–3 finger claw for quicker close-range drag",
      "Practice SMG / shotgun sprays in Training Ground first",
    ],
    buttonLabel: "Use Rusher in calculator",
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
    buttonLabel: "Use Sniper in calculator",
  },
];

const MAX_ROLE_TIPS: RoleTip[] = [
  {
    role: "rusher",
    title: "Max rusher tips",
    icon: "fa-person-running",
    tips: [
      "On Max, keep General slightly higher if FPS dips in close fights",
      "Don’t copy classic Free Fire rusher codes — Max drag feels heavier",
      "Warm up with SMG / shotgun in Training Ground on your Max graphics setting",
    ],
  },
  {
    role: "sniper",
    title: "Max sniper tips",
    icon: "fa-crosshairs",
    tips: [
      "Lower 2x / 4x a touch if scopes shake when Max effects kick in",
      "Lock Red Dot first, then sniper scope — one change at a time",
      "If the phone heats mid-match, drop effects before blaming sensi",
    ],
  },
];

type Props = {
  homeContent?: FfHomeRoleTips;
};

/**
 * Role tips — home Free Fire copy; Max page Free Fire Max copy.
 * CTA sets calculator role + scrolls up to tool.
 */
export function FfRoleTips({ homeContent }: Props) {
  const pathname = usePathname() ?? "";
  const isHome = pathname === "/" || pathname === "";
  const isMax = pathname === FREE_FIRE_MAX_PATH;
  if (!isHome && !isMax) return null;

  const sectionTitle =
    homeContent?.title ??
    (isMax ? "Best Free Fire Max sensi tips by role" : "Best sensi tips by role");
  const sourceItems = homeContent?.items ?? (isMax ? MAX_ROLE_TIPS : ROLE_TIPS);
  const tips: RoleTip[] = sourceItems.map((item) => ({
    role: item.role,
    title: item.title,
    icon: item.icon,
    tips: item.tips,
    buttonLabel:
      "buttonLabel" in item && typeof item.buttonLabel === "string" && item.buttonLabel
        ? item.buttonLabel
        : `Use ${item.role === "rusher" ? "Rusher" : "Sniper"} in ${
            isMax ? "Max calculator" : "calculator"
          }`,
  }));

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
        {sectionTitle}
      </h2>
      <div className="ff-role-tips-grid">
        {tips.map((card) => (
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
              {card.buttonLabel ??
                `Use ${card.role === "rusher" ? "Rusher" : "Sniper"} in ${
                  isMax ? "Max calculator" : "calculator"
                }`}
              <i className="fa-solid fa-arrow-up" aria-hidden />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
