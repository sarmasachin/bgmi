import type {
  BgmiLiteBetaFactsBlock,
  BgmiLiteBetaPreRegisterBlock,
} from "@/src/lib/bgmiLiteBetaApkSections";

export type FreeFireMaxApkInstallBlock = BgmiLiteBetaPreRegisterBlock;
export type FreeFireMaxApkFactsBlock = BgmiLiteBetaFactsBlock;

export const FREE_FIRE_MAX_APK_INSTALL: FreeFireMaxApkInstallBlock = {
  title: "How to install Free Fire MAX",
  intro:
    "Install Free Fire MAX from Google Play when you can. Use the APK button only if it is shown on this page and you trust the link.",
  steps: [
    "Open the Google Play Store on your Android phone.",
    'Search "Free Fire MAX" or tap the Play Store button above.',
    "Confirm the official Garena publisher on the store listing, then tap Install.",
    "After install, open the Free Fire MAX sensitivity calculator on this site.",
  ],
  guideHref: "#free-fire-max-apk-guide",
  guideLabel: "Read the full Free Fire MAX install and safety guide",
};

export const FREE_FIRE_MAX_APK_FACTS: FreeFireMaxApkFactsBlock = {
  title: "Free Fire MAX at a glance",
  rows: [
    { label: "Game", value: "Free Fire MAX" },
    { label: "Publisher", value: "Confirm on Google Play (Garena)" },
    { label: "Package", value: "com.dts.freefiremax" },
    { label: "Platform", value: "Android · Google Play" },
    { label: "Official install", value: "Google Play Store listing" },
    { label: "APK on this site", value: "Not hosted here — button is admin-controlled" },
    { label: "Sensitivity", value: "Use the Free Fire MAX calculator after install" },
    { label: "Standard version", value: "Free Fire has its own calculator on this site" },
  ],
  note:
    "Always confirm the publisher name on Google Play. This site does not host APK files. Admin can hide or update the Play Store and APK buttons at any time.",
};
