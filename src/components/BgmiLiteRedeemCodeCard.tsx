"use client";

import { useState } from "react";
import type { BgmiLiteRedeemCodeItem } from "@/src/lib/bgmiLiteRedeemCodes";
import type { BgmiLiteRedeemUiLabels } from "@/src/lib/bgmiLiteRedeemUiDefaults";
import { RedeemScheduleMeta } from "@/src/components/RedeemScheduleMeta";

type Props = {
  item: BgmiLiteRedeemCodeItem;
  ui: Pick<
    BgmiLiteRedeemUiLabels,
    | "liveBadge"
    | "expiredBadge"
    | "inactiveLabel"
    | "copyLabel"
    | "copiedLabel"
    | "copyFailedLabel"
    | "copyAriaCopied"
    | "copyAriaFailed"
    | "copyHint"
    | "expiredStatusLabel"
  >;
};

export function BgmiLiteRedeemCodeCard({ item, ui }: Props) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const isLive = item.status === "live";

  async function onCopy() {
    if (!isLive) return;
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(item.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
      setCopyError(true);
      window.setTimeout(() => setCopyError(false), 2200);
    }
  }

  return (
    <article
      className={`lite-redeem-card${isLive ? "" : " lite-redeem-card--expired"}`}
      aria-label={item.title}
    >
      <div className="lite-redeem-card-head">
        <h3 className="lite-redeem-card-title">{item.title}</h3>
        <div className="lite-redeem-badge-row">
          <span
            className={`lite-redeem-badge${isLive ? " lite-redeem-badge--live" : " lite-redeem-badge--expired"}`}
          >
            {isLive ? ui.liveBadge : ui.expiredBadge}
          </span>
        </div>
      </div>

      <div className={`lite-redeem-code-row${isLive ? "" : " lite-redeem-code-row--expired"}`}>
        <code className={`lite-redeem-code${isLive ? "" : " lite-redeem-code--struck"}`}>
          {item.code}
        </code>
        {isLive ? (
          <button
            type="button"
            className={`lite-redeem-copy${copied ? " lite-redeem-copy--done" : ""}${copyError ? " lite-redeem-copy--error" : ""}`}
            onClick={onCopy}
            aria-label={
              copyError
                ? ui.copyAriaFailed
                : copied
                  ? ui.copyAriaCopied
                  : `${ui.copyLabel} ${item.code}`
            }
          >
            <i
              className={`fa-solid ${copyError ? "fa-triangle-exclamation" : copied ? "fa-check" : "fa-copy"}`}
              aria-hidden
            />
            <span>
              {copyError ? ui.copyFailedLabel : copied ? ui.copiedLabel : ui.copyLabel}
            </span>
          </button>
        ) : (
          <span className="lite-redeem-inactive">{ui.inactiveLabel}</span>
        )}
      </div>

      {copyError ? (
        <p className="lite-redeem-copy-hint" role="status">
          {ui.copyHint}
        </p>
      ) : null}

      <div className="lite-redeem-card-meta">
        {isLive ? (
          <>
            <RedeemScheduleMeta icon="fa-clock" label={item.releasedLabel} />
            <RedeemScheduleMeta icon="fa-hourglass-half" label={item.expiresLabel} />
          </>
        ) : (
          <>
            <span className="lite-redeem-meta-item">{ui.expiredStatusLabel}</span>
            <RedeemScheduleMeta icon="fa-calendar-xmark" label={item.expiredOnLabel} />
          </>
        )}
      </div>
    </article>
  );
}
