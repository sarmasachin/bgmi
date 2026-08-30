/** Extra info blocks for /bgmi-lite-apk (pre-register + facts table). */

export type BgmiLiteBetaFactsRow = { label: string; value: string };

export type BgmiLiteBetaPreRegisterBlock = {
  title: string;
  intro: string;
  steps: string[];
  guideHref: string;
  guideLabel: string;
};

export type BgmiLiteBetaFactsBlock = {
  title: string;
  rows: BgmiLiteBetaFactsRow[];
  note: string;
};

export const BGMI_LITE_BETA_PREREGISTER: BgmiLiteBetaPreRegisterBlock = {
  title: "How to Pre-Register",
  intro:
    "BGMI Lite pre-registration is on Google Play (Android). Use only the official Krafton listing — never random APK sites:",
  steps: [
    "Open the Google Play Store on your Android phone.",
    'Search for "BGMI Lite" on the official Krafton listing.',
    'Tap "Pre-register" (or Install when the game is live).',
    "Optionally enable auto-install so Play can download when storage allows.",
  ],
  guideHref: "#bgmi-lite-apk-guide",
  guideLabel: "Read the full step-by-step pre-registration guide",
};

export const BGMI_LITE_BETA_FACTS: BgmiLiteBetaFactsBlock = {
  title: "What We Know So Far",
  rows: [
    { label: "Status", value: "Not released · pre-registration / countdown" },
    { label: "Region", value: "India (BGMI Lite)" },
    { label: "Krafton window", value: "End of 2026" },
    {
      label: "Countdown on this page",
      value: "12 November 2026 (IST) — confirm on Play / Krafton",
    },
    {
      label: "Expected download size",
      value: "Around 1 GB on Android (initial)",
    },
    { label: "Developer", value: "KRAFTON, Inc." },
    { label: "Platform (confirmed path)", value: "Android · Google Play" },
    { label: "Account", value: "Expect existing BGMI login if Krafton enables it" },
  ],
  note:
    "Figures above follow Krafton India / press coverage for BGMI Lite. Exact min specs and final store date can change — always confirm on Google Play before you install.",
};
