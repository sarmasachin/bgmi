import type {
  BgmiLiteBetaFactsBlock,
  BgmiLiteBetaPreRegisterBlock,
} from "@/src/lib/bgmiLiteBetaApkSections";

export type FreeFireApkInstallBlock = BgmiLiteBetaPreRegisterBlock;
export type FreeFireApkFactsBlock = BgmiLiteBetaFactsBlock;

export const FREE_FIRE_APK_INSTALL: FreeFireApkInstallBlock = {
  title: "How to install Free Fire",
  intro:
    "Install Free Fire from Google Play when you can. Use the APK button only if it is shown on this page and you trust the link.",
  steps: [
    "Open the Google Play Store on your Android phone.",
    'Search "Free Fire" or tap the Play Store button above.',
    "Confirm the official Garena publisher on the store listing, then tap Install.",
    "After install, open the Free Fire sensitivity calculator on this site.",
  ],
  guideHref: "#free-fire-apk-guide",
  guideLabel: "Read the full Free Fire install and safety guide",
};

export const FREE_FIRE_APK_FACTS: FreeFireApkFactsBlock = {
  title: "Free Fire at a glance",
  rows: [
    { label: "Game", value: "Free Fire" },
    { label: "Publisher", value: "Confirm on Google Play (Garena)" },
    { label: "Package", value: "com.dts.freefireth" },
    { label: "Platform", value: "Android · Google Play" },
    { label: "Official install", value: "Google Play Store listing" },
    { label: "APK on this site", value: "Not hosted here — button is admin-controlled" },
    { label: "Sensitivity", value: "Use the Free Fire calculator after install" },
    { label: "MAX version", value: "Free Fire MAX has its own calculator on this site" },
  ],
  note:
    "Always confirm the publisher name on Google Play. This site does not host APK files. Admin can hide or update the Play Store and APK buttons at any time.",
};
