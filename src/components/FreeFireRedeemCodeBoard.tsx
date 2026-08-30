"use client";

import { useMemo, useState, type ReactNode } from "react";
import { FreeFireRedeemCodeCard } from "@/src/components/FreeFireRedeemCodeCard";
import type { FreeFireRedeemCodeItem } from "@/src/lib/freeFireRedeemCodes";
import {
  FREE_FIRE_REDEEM_SERVER_TABS,
  codeMatchesFreeFireServerTab,
  coerceFreeFireRedeemServer,
  type FreeFireRedeemServerTabId,
} from "@/src/lib/freeFireRedeemServers";

const INITIAL_VISIBLE = 5;
const LOAD_STEP = 5;

type CardUi = Parameters<typeof FreeFireRedeemCodeCard>[0]["ui"];

type Props = {
  codes: FreeFireRedeemCodeItem[];
  sectionHeading: string;
  archiveHeading: string;
  emptyLive: string;
  emptyExpired: string;
  loadMoreLive: string;
  loadMoreExpired: string;
  ui: CardUi;
  freshness?: ReactNode;
};

function CodeList({
  items,
  emptyMessage,
  loadMoreLabel,
  ui,
}: {
  items: FreeFireRedeemCodeItem[];
  emptyMessage: string;
  loadMoreLabel: string;
  ui: CardUi;
}) {
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
            <FreeFireRedeemCodeCard item={item} ui={ui} />
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

/** Client board: server tabs + filtered live/expired Free Fire redeem cards. */
export function FreeFireRedeemCodeBoard({
  codes,
  sectionHeading,
  archiveHeading,
  emptyLive,
  emptyExpired,
  loadMoreLive,
  loadMoreExpired,
  ui,
  freshness,
}: Props) {
  const [tab, setTab] = useState<FreeFireRedeemServerTabId>("all");

  const filtered = useMemo(
    () =>
      codes.filter((c) =>
        codeMatchesFreeFireServerTab(coerceFreeFireRedeemServer(c.server), tab),
      ),
    [codes, tab],
  );
  const live = filtered.filter((c) => c.status === "live");
  const expired = filtered.filter((c) => c.status === "expired");

  return (
    <>
      <div className="ff-redeem-server-tabs" role="tablist" aria-label="Free Fire server">
        {FREE_FIRE_REDEEM_SERVER_TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`ff-redeem-server-tab${active ? " is-active" : ""}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <h2 className="lite-redeem-h2">{sectionHeading}</h2>
      {freshness}

      <CodeList
        key={`live-${tab}`}
        items={live}
        emptyMessage={emptyLive}
        loadMoreLabel={loadMoreLive}
        ui={ui}
      />

      {expired.length ? (
        <>
          <h2 className="lite-redeem-archive-h2">
            <i className="fa-solid fa-hourglass-half" aria-hidden />
            {archiveHeading}
          </h2>
          <CodeList
            key={`expired-${tab}`}
            items={expired}
            emptyMessage={emptyExpired}
            loadMoreLabel={loadMoreExpired}
            ui={ui}
          />
        </>
      ) : null}
    </>
  );
}
