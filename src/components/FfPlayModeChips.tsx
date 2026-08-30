"use client";

import { usePathname } from "next/navigation";
import type { CalcInputs } from "@/src/features/ffCalculator/calculator";
import { FF_SET_ROLE_EVENT } from "@/src/lib/ffPlayModes";
import {
  isHomeFfPath,
  isLiteCalculatorPath,
  pickLitePageContent,
} from "@/src/lib/gamePagePath";
import type { FfHomePlayModes } from "@/src/lib/homeCardsTypes";
import {
  LITE_SET_PLAY_STYLE_EVENT,
  litePlayerRoleFromChipRole,
} from "@/src/lib/litePlayModes";

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
  liteContent?: FfHomePlayModes;
  pubgLiteContent?: FfHomePlayModes;
};

export function FfPlayModeChips({ homeContent, liteContent, pubgLiteContent }: Props) {
  const pathname = usePathname() ?? "";
  const isHome = isHomeFfPath(pathname);
  const isLite = isLiteCalculatorPath(pathname);
  if (!isHome && !isLite) return null;

  const content = isLite
    ? pickLitePageContent(pathname, homeContent, liteContent, pubgLiteContent)
    : (homeContent ?? DEFAULT_MODES);
  if (!content) return null;

  function applyMode(mode: FfHomePlayModes["modes"][number]) {
    if (isLite) {
      window.dispatchEvent(
        new CustomEvent(LITE_SET_PLAY_STYLE_EVENT, {
          detail: { playerRole: litePlayerRoleFromChipRole(mode.role) },
        }),
      );
      document.getElementById("bgmi-lite-calculator")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      const roleSelect = document.getElementById(
        "lite-play-style",
      ) as HTMLSelectElement | null;
      roleSelect?.focus({ preventScroll: true });
      return;
    }

    window.dispatchEvent(
      new CustomEvent(FF_SET_ROLE_EVENT, {
        detail: { role: mode.role as CalcInputs["role"], modeId: mode.id },
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
