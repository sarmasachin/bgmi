/** Extra info blocks for /pubg-mobile-lite-apk (pre-register + facts table). */

export type PubgMobileLiteApkFactsRow = { label: string; value: string };

export type PubgMobileLiteApkInstallBlock = {
  title: string;
  intro: string;
  steps: string[];
  guideHref: string;
  guideLabel: string;
};

export type PubgMobileLiteApkFactsBlock = {
  title: string;
  rows: PubgMobileLiteApkFactsRow[];
  note: string;
};

export const PUBG_MOBILE_LITE_APK_INSTALL: PubgMobileLiteApkInstallBlock = {
  title: "How to Pre-Register",
  intro:
    "PUBG Mobile Lite pre-registration / install should be on Google Play (Android). Use only the official listing — never random APK sites:",
  steps: [
    "Open the Google Play Store on your Android phone.",
    'Search for "PUBG Mobile Lite" on the official listing.',
    'Tap "Pre-register" (or Install when the game is live).',
    "Optionally enable auto-install so Play can download when storage allows.",
  ],
  guideHref: "#pubg-mobile-lite-apk-guide",
  guideLabel: "Read the full step-by-step pre-registration guide",
};

export const PUBG_MOBILE_LITE_APK_FACTS: PubgMobileLiteApkFactsBlock = {
  title: "What We Know So Far",
  rows: [
    { label: "Status", value: "Countdown · confirm on Google Play" },
    { label: "Audience", value: "Budget / older Android phones (Lite-class)" },
    {
      label: "Countdown on this page",
      value: "12 November 2026 (IST) — same target as BGMI Lite",
    },
    { label: "Install path", value: "Android · Google Play (official only)" },
    { label: "Developer", value: "PUBG / Krafton (confirm on store)" },
    { label: "Sensitivity", value: "Use /pubg-mobile-lite calculator on this site" },
  ],
  note:
    "The 12 November 2026 date is this site’s shared Lite countdown target (same as BGMI Lite). Exact store availability can change — always confirm on Google Play before you install.",
};
