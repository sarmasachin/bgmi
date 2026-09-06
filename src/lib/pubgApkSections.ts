import type {
  BgmiLiteBetaFactsBlock,
  BgmiLiteBetaPreRegisterBlock,
} from "@/src/lib/bgmiLiteBetaApkSections";

export type PubgApkInstallBlock = BgmiLiteBetaPreRegisterBlock;
export type PubgApkFactsBlock = BgmiLiteBetaFactsBlock;

export const PUBG_APK_INSTALL: PubgApkInstallBlock = {
  title: "How to install PUBG Mobile",
  intro:
    "Install full PUBG Mobile from Google Play when you can. Use the APK button only if it is shown on this page and you trust the link.",
  steps: [
    "Open the Google Play Store on your Android phone.",
    'Search "PUBG Mobile" or tap the Play Store button above.',
    "Confirm the official publisher on the store listing, then tap Install.",
    "After install, set a stable FPS and open the PUBG Mobile sensitivity calculator.",
  ],
  guideHref: "#pubg-apk-guide",
  guideLabel: "Read the full PUBG Mobile install and safety guide",
};

export const PUBG_APK_FACTS: PubgApkFactsBlock = {
  title: "PUBG Mobile at a glance",
  rows: [
    { label: "Game", value: "PUBG Mobile" },
    { label: "Publisher", value: "Confirm on Google Play (Krafton / Level Infinite)" },
    { label: "Region", value: "Global (not BGMI India listing)" },
    { label: "Platform", value: "Android · Google Play" },
    { label: "Official install", value: "Google Play Store listing" },
    { label: "APK on this site", value: "Not hosted here — button is admin-controlled" },
    { label: "Sensitivity", value: "Use the PUBG Mobile calculator after install" },
    { label: "Lighter client", value: "PUBG Mobile Lite is a separate page / listing" },
  ],
  note:
    "Always confirm the publisher name on Google Play. This site does not host APK files. Admin can hide or update the Play Store and APK buttons at any time.",
};
