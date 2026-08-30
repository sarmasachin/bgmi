"use client";

import { usePathname } from "next/navigation";
import {
  isLiteCalculatorPath,
  pickLitePageContent,
} from "@/src/lib/gamePagePath";
import type { FfHomeHowItWorks } from "@/src/lib/homeCardsTypes";

type Step = {
  title: string;
  bullets: string[];
  icon: string;
};

const FF_STEPS: Step[] = [
  {
    title: "Select Device",
    icon: "fa-mobile-screen",
    bullets: [
      "Open the Free Fire calculator on home",
      "Type your phone name or pick from suggestions",
      "Confirm the device matches what you play on",
    ],
  },
  {
    title: "Enter Model",
    icon: "fa-keyboard",
    bullets: [
      "Select your phone RAM (2GB–12GB+)",
      "Choose DPI mode (default or custom)",
      "Set the FPS you usually play at",
    ],
  },
  {
    title: "Device Age",
    icon: "fa-clock-rotate-left",
    bullets: [
      "Enter how old your device is",
      "Pick your finger setup (2 / 3 / 4 finger)",
      "Choose role and grip style",
    ],
  },
  {
    title: "Generate",
    icon: "fa-wand-magic-sparkles",
    bullets: [
      "Tap Calculate Sensitivity",
      "Copy General, Red Dot, scopes & free look",
      "Paste in Free Fire and test in Training Ground",
    ],
  },
];

const BGMI_STEPS: Step[] = [
  {
    title: "Select Device",
    icon: "fa-mobile-screen",
    bullets: [
      "Open the BGMI / PUBG calculator",
      "Pick your phone model from the list",
      "Use the closest match if your exact model is missing",
    ],
  },
  {
    title: "Enter Setup",
    icon: "fa-keyboard",
    bullets: [
      "Choose your FPS / graphics mode",
      "Set gyroscope on or off",
      "Select camera / ADS preferences",
    ],
  },
  {
    title: "Adjust Style",
    icon: "fa-sliders",
    bullets: [
      "Choose thumbs or claw play style",
      "Match settings to your aim comfort",
      "Keep values realistic for your device",
    ],
  },
  {
    title: "Generate",
    icon: "fa-wand-magic-sparkles",
    bullets: [
      "Tap Calculate for no-recoil values",
      "Copy camera, ADS, and gyro settings",
      "Apply in-game and fine-tune in training",
    ],
  },
];

const BGMI_LITE_STEPS: Step[] = [
  {
    title: "Select Device",
    icon: "fa-mobile-screen",
    bullets: [
      "Open the BGMI Lite calculator",
      "Pick a budget phone close to yours (Redmi, Realme, Infinix…)",
      "Confirm RAM matches your device (often 2–4GB)",
    ],
  },
  {
    title: "Enter Setup",
    icon: "fa-keyboard",
    bullets: [
      "Choose the FPS you hold stable (30 / 40 / 60)",
      "Set gyroscope to Scope On on entry phones",
      "Select play style and finger layout",
    ],
  },
  {
    title: "Generate",
    icon: "fa-wand-magic-sparkles",
    bullets: [
      "Tap Calculate for Camera, ADS, and Gyro",
      "Copy values into BGMI Lite Settings",
      "Tune Red Dot / 3x / 6x in Training Ground (±5)",
    ],
  },
  {
    title: "Stay Stable",
    icon: "fa-gauge-high",
    bullets: [
      "Prefer Smooth graphics for steady FPS",
      "Avoid copying flagship 90/120 FPS codes",
      "Retune after Krafton’s final Lite client ships",
    ],
  },
];

type Props = {
  homeContent?: FfHomeHowItWorks;
  liteContent?: FfHomeHowItWorks;
  pubgLiteContent?: FfHomeHowItWorks;
};

export function HowItWorksSection({
  homeContent,
  liteContent,
  pubgLiteContent,
}: Props) {
  const pathname = usePathname() ?? "";
  const isPubg = pathname === "/pubg" || pathname.startsWith("/pubg/");
  const isLite = isLiteCalculatorPath(pathname);
  const isBgmi =
    !isLite && (pathname === "/bgmi" || pathname.startsWith("/bgmi/"));
  const isHomeFf = !isPubg && !isBgmi && !isLite;

  const litePack = pickLitePageContent(
    pathname,
    homeContent,
    liteContent,
    pubgLiteContent,
  );
  const steps = isLite
    ? (litePack?.steps ?? BGMI_LITE_STEPS)
    : isPubg || isBgmi
      ? BGMI_STEPS
      : (homeContent?.steps ?? FF_STEPS);
  const title = isLite
    ? (litePack?.title ?? "How It Works")
    : isHomeFf
      ? (homeContent?.title ?? "How It Works")
      : "How It Works";
  const subtitle = isLite
    ? (litePack?.subtitle ??
      "Four steps to Lite-ready Camera, ADS, and Gyroscope settings.")
    : isPubg || isBgmi
      ? "Get your pro sensitivity in just 4 simple steps."
      : (homeContent?.subtitle ?? "Get your Free Fire pro settings in just 4 simple steps.");

  return (
    <section className="how-works" aria-labelledby="how-works-title">
      <h2 id="how-works-title" className="how-works-title">
        {title}
      </h2>
      <p className="how-works-subtitle">{subtitle}</p>
      <ol className="how-works-grid">
        {steps.map((step, index) => (
          <li key={`${step.title}-${index}`} className="how-works-card">
            <span className="how-works-num" aria-hidden>
              {index + 1}
            </span>
            <i className={`fa-solid ${step.icon} how-works-icon`} aria-hidden />
            <h3 className="how-works-card-title">{step.title}</h3>
            <ul className="how-works-bullets">
              {step.bullets.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
