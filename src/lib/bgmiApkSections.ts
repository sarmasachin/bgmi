import type {
  BgmiLiteBetaFactsBlock,
  BgmiLiteBetaPreRegisterBlock,
} from "@/src/lib/bgmiLiteBetaApkSections";

export type BgmiApkInstallBlock = BgmiLiteBetaPreRegisterBlock;
export type BgmiApkFactsBlock = BgmiLiteBetaFactsBlock;

export const BGMI_APK_INSTALL: BgmiApkInstallBlock = {
  title: "How to install BGMI",
  intro:
    "Install full BGMI from Google Play when you can. Use the APK button only if it is shown on this page and you trust the link.",
  steps: [
    "Open the Google Play Store on your Android phone.",
    'Search "Battlegrounds Mobile India" or tap the Play Store button above.',
    "Confirm the publisher is KRAFTON, Inc., then tap Install.",
    "After install, set a stable FPS and open the BGMI sensitivity calculator.",
  ],
  guideHref: "#bgmi-apk-guide",
  guideLabel: "Read the full BGMI install and safety guide",
};

export const BGMI_APK_FACTS: BgmiApkFactsBlock = {
  title: "BGMI at a glance",
  rows: [
    { label: "Game", value: "Battlegrounds Mobile India (BGMI)" },
    { label: "Publisher", value: "KRAFTON, Inc." },
    { label: "Region", value: "India" },
    { label: "Platform", value: "Android · Google Play" },
    { label: "Official install", value: "Google Play Store listing" },
    { label: "APK on this site", value: "Not hosted here — button is admin-controlled" },
    { label: "Sensitivity", value: "Use the BGMI calculator after install" },
    { label: "Lighter client", value: "BGMI Lite is a separate page / listing" },
  ],
  note:
    "Always confirm the publisher name on Google Play. This site does not host APK files. Admin can hide or update the Play Store and APK buttons at any time.",
};
