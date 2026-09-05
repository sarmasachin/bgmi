"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FreeFireRedeemCodeCard } from "@/src/components/FreeFireRedeemCodeCard";
import type { FreeFireRedeemCodeItem } from "@/src/lib/freeFireRedeemCodes";
import {
  buildFreeFireRedeemServerTabs,
  codeMatchesFreeFireServerTab,
  coerceFreeFireRedeemServer,
  type FreeFireRedeemServerConfig,
  type FreeFireRedeemServerTabId,
} from "@/src/lib/freeFireRedeemServers";
import {
  applyAutoExpireRedeemCode,
  isRedeemCodePubliclyLive,
  isValidRedeemScheduleIso,
  sortExpiredRedeemCodesNewestFirst,
} from "@/src/lib/redeemCodeSchedule";

const INITIAL_VISIBLE = 5;
const LOAD_STEP = 5;

type CardUi = Parameters<typeof FreeFireRedeemCodeCard>[0]["ui"];

/** Strip a trailing " – Region" from CMS heading, then append the active tab label. */
function sectionHeadingForTab(
  sectionHeading: string,
  tab: FreeFireRedeemServerTabId,
  tabs: Array<{ id: string; label: string }>,
): string {
  const raw = sectionHeading.trim() || "Active redeem codes";
  const base = raw.replace(/\s*[–—-]\s+[^–—-]+$/u, "").trim() || raw;
  const tabLabel = tabs.find((t) => t.id === tab)?.label?.trim() || "All";
  return `${base} – ${tabLabel}`;
}

type Props = {
  codes: FreeFireRedeemCodeItem[];
  servers: FreeFireRedeemServerConfig[];
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
  servers,
}: {
  items: FreeFireRedeemCodeItem[];
  emptyMessage: string;
  loadMoreLabel: string;
  ui: CardUi;
  servers: FreeFireRedeemServerConfig[];
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
            <FreeFireRedeemCodeCard item={item} ui={ui} servers={servers} />
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
  servers,
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
  const [nowMs, setNowMs] = useState(() => Date.now());

  const serverList = servers;
  const tabs = buildFreeFireRedeemServerTabs(serverList);

  const effectiveCodes = useMemo(
    () => codes.map((c) => applyAutoExpireRedeemCode(c, nowMs)),
    [codes, nowMs],
  );

  useEffect(() => {
    const wakeTimes = effectiveCodes
      .filter((c) => c.status === "live")
      .flatMap((c) => {
        const times: number[] = [];
        if (isValidRedeemScheduleIso(c.releasedAt)) {
          const t = Date.parse(c.releasedAt);
          if (Number.isFinite(t) && t > Date.now()) times.push(t);
        }
        if (isValidRedeemScheduleIso(c.expiresAt)) {
          const t = Date.parse(c.expiresAt);
          if (Number.isFinite(t) && t > Date.now()) times.push(t);
        }
        return times;
      })
      .sort((a, b) => a - b);
    const next = wakeTimes[0];
    if (next == null) return;
    const delay = Math.min(Math.max(next - Date.now() + 300, 300), 2_147_483_647);
    const id = window.setTimeout(() => setNowMs(Date.now()), delay);
    return () => window.clearTimeout(id);
  }, [effectiveCodes]);

  const filtered = useMemo(
    () =>
      effectiveCodes.filter((c) =>
        codeMatchesFreeFireServerTab(coerceFreeFireRedeemServer(c.server, serverList), tab, serverList),
      ),
    [effectiveCodes, tab, serverList],
  );
  const live = filtered.filter((c) => isRedeemCodePubliclyLive(c, nowMs));
  const expired = sortExpiredRedeemCodesNewestFirst(
    filtered.filter((c) => c.status === "expired"),
  );
  const heading = sectionHeadingForTab(sectionHeading, tab, tabs);

  return (
    <>
      <div className="ff-redeem-server-tabs" role="tablist" aria-label="Free Fire server">
        {tabs.map((item) => {
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

      <h2 className="lite-redeem-h2">{heading}</h2>
      {freshness}

      <CodeList
        key={`live-${tab}-${live.map((c) => c.id).join(",")}`}
        items={live}
        emptyMessage={emptyLive}
        loadMoreLabel={loadMoreLive}
        ui={ui}
        servers={serverList}
      />

      {expired.length ? (
        <>
          <h2 className="lite-redeem-archive-h2">
            <i className="fa-solid fa-hourglass-half" aria-hidden />
            {archiveHeading}
          </h2>
          <CodeList
            key={`expired-${tab}-${expired.map((c) => c.id).join(",")}`}
            items={expired}
            emptyMessage={emptyExpired}
            loadMoreLabel={loadMoreExpired}
            ui={ui}
            servers={serverList}
          />
        </>
      ) : null}
    </>
  );
}
