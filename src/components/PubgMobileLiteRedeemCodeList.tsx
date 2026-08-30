"use client";

import { useState } from "react";
import { PubgMobileLiteRedeemCodeCard } from "@/src/components/PubgMobileLiteRedeemCodeCard";
import type { PubgMobileLiteRedeemCodeItem } from "@/src/lib/pubgMobileLiteRedeemCodes";

const INITIAL_VISIBLE = 5;
const LOAD_STEP = 5;

type CardUi = Parameters<typeof PubgMobileLiteRedeemCodeCard>[0]["ui"];

type Props = {
  items: PubgMobileLiteRedeemCodeItem[];
  emptyMessage: string;
  loadMoreLabel: string;
  ui: CardUi;
};

/** Shows first 5 cards, then Load more in steps of 5. */
export function PubgMobileLiteRedeemCodeList({
  items,
  emptyMessage,
  loadMoreLabel,
  ui,
}: Props) {
  const [visible, setVisible] = useState(INITIAL_VISIBLE);

  if (!items.length) {
    return <p className="lite-redeem-empty">{emptyMessage}</p>;
  }

  const shown = items.slice(0, visible);
  const hasMore = visible < items.length;

  return (
    <>
      <div className="lite-redeem-stack" role="list">
        {shown.map((item) => (
          <div key={item.id} role="listitem">
            <PubgMobileLiteRedeemCodeCard item={item} ui={ui} />
          </div>
        ))}
      </div>
      {hasMore ? (
        <div className="lite-redeem-load-more-wrap">
          <button
            type="button"
            className="lite-redeem-load-more"
            onClick={() => setVisible((n) => Math.min(n + LOAD_STEP, items.length))}
          >
            {loadMoreLabel}
            <span className="lite-redeem-load-more-count">
              ({Math.min(visible, items.length)} / {items.length})
            </span>
          </button>
        </div>
      ) : null}
    </>
  );
}
