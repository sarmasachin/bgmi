"use client";

import { usePathname } from "next/navigation";
import type { CalcInputs } from "@/src/features/ffCalculator/calculator";
import { FF_SET_ROLE_EVENT } from "@/src/lib/ffPlayModes";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import {
  isHomeFfPath,
  isLiteCalculatorPath,
  pickLitePageContent,
} from "@/src/lib/gamePagePath";
import type { FfHomeRoleTip, FfHomeRoleTips } from "@/src/lib/homeCardsTypes";
import {
  LITE_SET_PLAY_STYLE_EVENT,
  litePlayerRoleFromChipRole,
} from "@/src/lib/litePlayModes";

type RoleTip = FfHomeRoleTip;

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
    title: "DPI/SPI + Sensitivity Guide",
    icon: "fa-bolt",
    lead: "Higher DPI/SPI makes the screen feel faster. If you raised DPI/SPI, keep sensi a bit lower so your crosshair does not jump past the enemy’s head.",
    tips: [
      "No DPI/SPI = higher sensi OK",
      "Mid/High DPI/SPI = control first",
      "Match calculator DPI/SPI to your phone",
    ],
    buttonLabel: "Get DPI/SPI Tuned Sensi",
    applyRole: false,
    focusControlId: "ffc-dpi",
  },
  {
    role: "flanker",
    title: "Free Fire Sensi for Beginners",
    icon: "fa-graduation-cap",
    lead: "New players often copy pro settings and miss shots. Start with a balanced sensi matched to your phone RAM and FPS, then fine-tune in Training Ground.",
    tips: [
      "Safe starting values for 2–4 finger play",
      "Works on low & mid RAM phones",
      "Learn drag before chasing high sensi",
    ],
    buttonLabel: "Calculate Beginner Sensi Now",
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
    buttonLabel: "Use Rusher in Max calculator",
  },
  {
    role: "sniper",
    title: "DPI/SPI + Sensitivity Guide",
    icon: "fa-bolt",
    lead: "Higher DPI/SPI makes aim feel faster on Max too. If you raised DPI/SPI, keep sensi a bit lower so the crosshair does not jump past the head.",
    tips: [
      "No DPI/SPI = higher sensi OK",
      "Mid/High DPI/SPI = control first",
      "Match calculator DPI/SPI to your phone",
    ],
    buttonLabel: "Get DPI/SPI Tuned Sensi",
    applyRole: false,
    focusControlId: "ffc-dpi",
  },
  {
    role: "flanker",
    title: "Free Fire Max Sensi for Beginners",
    icon: "fa-graduation-cap",
    lead: "New Max players often reuse classic Free Fire codes and miss. Start balanced for your RAM and FPS, then warm up on Max graphics.",
    tips: [
      "Safe starting values for 2–4 finger play",
      "Works on mid-range and 6GB+ phones",
      "Learn Max drag before chasing high sensi",
    ],
    buttonLabel: "Calculate Beginner Max Sensi Now",
  },
];

function defaultButtonLabel(item: RoleTip, isMax: boolean) {
  if (item.focusControlId === "ffc-dpi") return "Get DPI/SPI Tuned Sensi";
  const calc = isMax ? "Max calculator" : "calculator";
  if (item.role === "rusher") return `Use Rusher in ${calc}`;
  if (item.role === "flanker") {
    return isMax ? "Calculate Beginner Max Sensi Now" : "Calculate Beginner Sensi Now";
  }
  return `Use ${item.role} in ${calc}`;
}

type Props = {
  homeContent?: FfHomeRoleTips;
  liteContent?: FfHomeRoleTips;
  pubgLiteContent?: FfHomeRoleTips;
};

/** Tip cards under calculator — Free Fire / Max / Lite calculators. */
export function FfRoleTips({ homeContent, liteContent, pubgLiteContent }: Props) {
  const pathname = usePathname() ?? "";
  const isHome = isHomeFfPath(pathname);
  const isMax = pathname === FREE_FIRE_MAX_PATH;
  const isLite = isLiteCalculatorPath(pathname);
  if (!isHome && !isMax && !isLite) return null;

  const pack = isLite
    ? pickLitePageContent(pathname, homeContent, liteContent, pubgLiteContent)
    : homeContent;
  const sectionTitle =
    pack?.title ??
    (isMax ? "Best Free Fire Max sensi tips by role" : "Best sensi tips by role");
  const sourceItems = pack?.items ?? (isMax ? MAX_ROLE_TIPS : ROLE_TIPS);
  const tips: RoleTip[] = sourceItems.map((item) => ({
    ...item,
    buttonLabel: item.buttonLabel?.trim() || defaultButtonLabel(item, isMax),
  }));

  function onCardCta(card: RoleTip) {
    if (isLite) {
      if (card.applyRole !== false) {
        window.dispatchEvent(
          new CustomEvent(LITE_SET_PLAY_STYLE_EVENT, {
            detail: { playerRole: litePlayerRoleFromChipRole(card.role) },
          }),
        );
      }
      document.getElementById("bgmi-lite-calculator")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      document.getElementById("lite-play-style")?.focus({ preventScroll: true });
      return;
    }

    if (card.applyRole !== false) {
      window.dispatchEvent(
        new CustomEvent(FF_SET_ROLE_EVENT, {
          detail: { role: card.role as CalcInputs["role"], modeId: card.role },
        }),
      );
    }
    document.getElementById("ff-calculator")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    const focusId =
      card.focusControlId?.trim() ||
      (card.applyRole === false ? "" : "ffc-role");
    if (focusId) {
      const el = document.getElementById(focusId) as HTMLElement | null;
      el?.focus({ preventScroll: true });
    }
  }

  return (
    <section className="ff-role-tips" aria-labelledby="ff-role-tips-title">
      <h2 id="ff-role-tips-title" className="ff-role-tips-title">
        {sectionTitle}
      </h2>
      <div className="ff-role-tips-grid">
        {tips.map((card, index) => (
          <article key={`${card.role}-${index}`} className="ff-role-tip-card">
            <div className="ff-role-tip-head">
              <span className="ff-role-tip-icon" aria-hidden>
                <i className={`fa-solid ${card.icon}`} />
              </span>
              <h3 className="ff-role-tip-name">{card.title}</h3>
            </div>
            {card.lead ? <p className="ff-role-tip-lead">{card.lead}</p> : null}
            <ul className="ff-role-tip-list">
              {card.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
            <button
              type="button"
              className="ff-role-tip-btn"
              onClick={() => onCardCta(card)}
            >
              {card.buttonLabel}
              <i className="fa-solid fa-arrow-up" aria-hidden />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
