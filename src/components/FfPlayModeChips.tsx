"use client";

import { usePathname } from "next/navigation";
import type { CalcInputs } from "@/src/features/ffCalculator/calculator";
import { FF_SET_ROLE_EVENT } from "@/src/lib/ffPlayModes";
import type { FfHomePlayModes } from "@/src/lib/homeCardsTypes";

const DEFAULT_MODES: FfHomePlayModes = {
  title: "Choose your play mode",
  lead: "Tap a mode — calculator Player Role updates automatically.",
  modes: [
    {
      id: "rusher",
      label: "Rusher",
      blurb: "Close-range aggressive aim",
      icon: "fa-person-running",
      role: "rusher",
    },
    {
      id: "sniper",
      label: "Sniper",
      blurb: "Long-range scope control",
      icon: "fa-crosshairs",
      role: "sniper",
    },
    {
      id: "clash-squad",
      label: "Clash Squad",
      blurb: "Fast 4v4 fights",
      icon: "fa-users",
      role: "rusher",
    },
    {
      id: "battle-royale",
      label: "Battle Royale",
      blurb: "Full map survival",
      icon: "fa-map",
      role: "sniper",
    },
  ],
};

type Props = {
  homeContent?: FfHomePlayModes;
};

export function FfPlayModeChips({ homeContent }: Props) {
  const pathname = usePathname() ?? "";
  if (pathname !== "/" && pathname !== "") return null;

  const content = homeContent ?? DEFAULT_MODES;

  function applyMode(mode: FfHomePlayModes["modes"][number]) {
    window.dispatchEvent(
      new CustomEvent(FF_SET_ROLE_EVENT, {
        detail: { role: mode.role as CalcInputs["role"], modeId: mode.id },
      }),
    );
    const el = document.getElementById("ff-calculator");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    const roleSelect = document.getElementById("ffc-role") as HTMLSelectElement | null;
    if (roleSelect) {
      roleSelect.focus({ preventScroll: true });
    }
  }

  return (
    <section className="ff-modes" aria-labelledby="ff-modes-title">
      <h2 id="ff-modes-title" className="ff-modes-title">
        {content.title}
      </h2>
      <p className="ff-modes-lead">{content.lead}</p>
      <div className="ff-modes-grid" role="group" aria-label="Play modes">
        {content.modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className="ff-mode-chip"
            onClick={() => applyMode(mode)}
          >
            <span className="ff-mode-icon" aria-hidden>
              <i className={`fa-solid ${mode.icon}`} />
            </span>
            <span className="ff-mode-text">
              <strong>{mode.label}</strong>
              <span>{mode.blurb}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
