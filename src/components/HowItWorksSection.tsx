"use client";

import { usePathname } from "next/navigation";

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

export function HowItWorksSection() {
  const pathname = usePathname() ?? "";
  const isPubg = pathname === "/pubg" || pathname.startsWith("/pubg/");
  const isBgmi = pathname === "/bgmi" || pathname.startsWith("/bgmi/");
  const steps = isPubg || isBgmi ? BGMI_STEPS : FF_STEPS;
  const subtitle =
    isPubg || isBgmi
      ? "Get your pro sensitivity in just 4 simple steps."
      : "Get your Free Fire pro settings in just 4 simple steps.";

  return (
    <section className="how-works" aria-labelledby="how-works-title">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
      <h2 id="how-works-title" className="how-works-title">
        How It Works
      </h2>
      <p className="how-works-subtitle">{subtitle}</p>
      <ol className="how-works-grid">
        {steps.map((step, index) => (
          <li key={step.title} className="how-works-card">
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
