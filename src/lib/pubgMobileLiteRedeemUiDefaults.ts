/** Admin-editable UI strings for /pubg-mobile-lite-redeem-code (path stays locked). */

export type PubgMobileLiteRedeemUiLabels = {
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

export const DEFAULT_PUBG_MOBILE_LITE_REDEEM_UI: PubgMobileLiteRedeemUiLabels = {
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
    "Fresh PUBG Mobile Lite redeem codes were not published today (IST). Check back later — older live codes below may still work until they expire.",
  updatedLabelPrefix: "Updated",
  faqTitle: "PUBG Mobile Lite Redeem Codes FAQ",
  breadcrumbName: "Redeem Code",
  socialImage: "/icon.png?v=3",
  socialImageAlt: "Sensitivity Settings — PUBG Mobile Lite redeem codes",
};

export function clonePubgMobileLiteRedeemUi(
  ui: PubgMobileLiteRedeemUiLabels = DEFAULT_PUBG_MOBILE_LITE_REDEEM_UI,
): PubgMobileLiteRedeemUiLabels {
  return { ...ui };
}
