/** Admin-editable UI strings for /pubg-redeem-code (path stays locked). */

export type PubgRedeemUiLabels = {
  liveBadge: string;
  expiredBadge: string;
  inactiveLabel: string;
  copyLabel: string;
  copiedLabel: string;
  copyFailedLabel: string;
  copyAriaCopied: string;
  copyAriaFailed: string;
  copyHint: string;
  expiredStatusLabel: string;
  loadMoreLive: string;
  loadMoreExpired: string;
  emptyLiveToday: string;
  emptyLiveIdle: string;
  emptyExpired: string;
  freshnessIdleTitle: string;
  freshnessIdleText: string;
  updatedLabelPrefix: string;
  faqTitle: string;
  breadcrumbName: string;
  socialImage: string;
  socialImageAlt: string;
};

export const DEFAULT_PUBG_REDEEM_UI: PubgRedeemUiLabels = {
  liveBadge: "LIVE",
  expiredBadge: "EXPIRED",
  inactiveLabel: "Inactive",
  copyLabel: "Copy Code",
  copiedLabel: "Copied",
  copyFailedLabel: "Copy failed",
  copyAriaCopied: "Code copied",
  copyAriaFailed: "Copy failed",
  copyHint: "Clipboard blocked — select the code and copy manually.",
  expiredStatusLabel: "Status: Expired",
  loadMoreLive: "Load more codes",
  loadMoreExpired: "Load more expired",
  emptyLiveToday: "No live codes right now. Check back soon.",
  emptyLiveIdle: "No live codes available right now. Come back after the next drop.",
  emptyExpired: "No expired codes in the archive yet.",
  freshnessIdleTitle: "No new codes today",
  freshnessIdleText:
    "Fresh PUBG Mobile redeem codes were not published today (IST). Check back later — older live codes below may still work until they expire.",
  updatedLabelPrefix: "Updated",
  faqTitle: "PUBG Mobile Redeem Codes FAQ",
  breadcrumbName: "PUBG Redeem Code",
  socialImage: "/icon.png?v=3",
  socialImageAlt: "Sensitivity Settings — PUBG Mobile redeem codes",
};

export function clonePubgRedeemUi(
  ui: PubgRedeemUiLabels = DEFAULT_PUBG_REDEEM_UI,
): PubgRedeemUiLabels {
  return { ...ui };
}
