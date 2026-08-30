"use client";

import { useState } from "react";
import type { BgmiLiteRedeemCodeItem } from "@/src/lib/bgmiLiteRedeemCodes";
import type { BgmiLiteRedeemUiLabels } from "@/src/lib/bgmiLiteRedeemUiDefaults";

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
        <span
          className={`lite-redeem-badge${isLive ? " lite-redeem-badge--live" : " lite-redeem-badge--expired"}`}
        >
          {isLive ? ui.liveBadge : ui.expiredBadge}
        </span>
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
            <span className="lite-redeem-meta-item">
              <i className="fa-solid fa-clock" aria-hidden />
              {item.releasedLabel}
            </span>
            <span className="lite-redeem-meta-item">
              <i className="fa-solid fa-hourglass-half" aria-hidden />
              {item.expiresLabel}
            </span>
          </>
        ) : (
          <>
            <span className="lite-redeem-meta-item">{ui.expiredStatusLabel}</span>
            <span className="lite-redeem-meta-item">{item.expiredOnLabel}</span>
          </>
        )}
      </div>
    </article>
  );
}
