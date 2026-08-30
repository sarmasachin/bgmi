"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildStylishVariants,
  LITE_NAME_SOFT_LIMIT,
  STYLISH_FILTERS,
  stylishNameLength,
  type StylishCategory,
} from "@/src/lib/bgmiLiteStylishNameFonts";

type Props = {
  tipText: string;
  /** Empty-state hint under the input (brand-specific). */
  emptyText?: string;
};

type FilterId = StylishCategory | "all";

const INITIAL_VISIBLE = 10;
const LOAD_STEP = 10;

/** Mobile-first studio — gallery-style names + load more after 10. */
export function BgmiLiteStylishNameStudio({
  tipText,
  emptyText = "Type a name to see stylish BGMI Lite IDs.",
}: Props) {
  const [base, setBase] = useState("");
  const [active, setActive] = useState<FilterId>("all");
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyError, setCopyError] = useState(false);

  const variants = useMemo(() => buildStylishVariants(base), [base]);
  const filtered =
    active === "all" ? variants : variants.filter((v) => v.category === active);

  useEffect(() => {
    setVisible(INITIAL_VISIBLE);
  }, [base, active]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  async function copyValue(id: string, value: string) {
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1400);
    } catch {
      setCopyError(true);
      window.setTimeout(() => setCopyError(false), 2200);
    }
  }

  const liveLen = stylishNameLength(base.trim());

  return (
    <section className="lite-stylish-studio" aria-label="Stylish name studio">
      <label className="lite-stylish-field">
        <span className="lite-stylish-field-label">Your name</span>
        <input
          className="lite-stylish-input"
          type="text"
          inputMode="text"
          autoComplete="nickname"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={32}
          placeholder="Type here…"
          value={base}
          onChange={(e) => setBase(e.target.value)}
          aria-describedby="lite-stylish-meter lite-stylish-tip"
        />
      </label>

      <div
        id="lite-stylish-meter"
        className={`lite-stylish-meter${liveLen > LITE_NAME_SOFT_LIMIT ? " is-over" : ""}`}
        role="status"
      >
        <span className="lite-stylish-meter-bar" aria-hidden>
          <span
            className="lite-stylish-meter-fill"
            style={{
              width: `${Math.min(100, (liveLen / LITE_NAME_SOFT_LIMIT) * 100)}%`,
            }}
          />
        </span>
        <span className="lite-stylish-meter-text">
          {liveLen} / {LITE_NAME_SOFT_LIMIT} guide
        </span>
      </div>

      <p id="lite-stylish-tip" className="lite-stylish-tip">
        {tipText}
      </p>

      <div className="lite-stylish-chips" role="tablist" aria-label="Style filter">
        {STYLISH_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={active === f.id}
            className={`lite-stylish-chip${active === f.id ? " is-on" : ""}`}
            onClick={() => setActive(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {copyError ? (
        <p className="lite-stylish-copy-error" role="alert">
          Copy blocked — long-press the name and copy manually.
        </p>
      ) : null}

      <div className="lite-stylish-results" role="list">
        {!base.trim() ? (
          <p className="lite-stylish-empty">{emptyText}</p>
        ) : filtered.length === 0 ? (
          <p className="lite-stylish-empty">No styles in this filter — try All.</p>
        ) : (
          shown.map((row) => {
            const over = row.length > LITE_NAME_SOFT_LIMIT;
            const isCopied = copiedId === row.id;
            return (
              <div key={row.id} className="lite-stylish-result" role="listitem">
                <div className="lite-stylish-result-main">
                  <span className="lite-stylish-result-label">
                    {row.label}
                    <em>{row.hint}</em>
                  </span>
                  <p className="lite-stylish-result-value">{row.value}</p>
                  <span className={`lite-stylish-result-len${over ? " is-over" : ""}`}>
                    {row.length} chars
                  </span>
                </div>
                <button
                  type="button"
                  className={`lite-stylish-copy${isCopied ? " is-done" : ""}`}
                  onClick={() => void copyValue(row.id, row.value)}
                >
                  {isCopied ? "Copied" : "Copy"}
                </button>
              </div>
            );
          })
        )}
      </div>

      {base.trim() && hasMore ? (
        <div className="lite-redeem-load-more-wrap">
          <button
            type="button"
            className="lite-redeem-load-more"
            onClick={() => setVisible((n) => Math.min(n + LOAD_STEP, filtered.length))}
          >
            Load more names
            <span className="lite-redeem-load-more-count">
              ({Math.min(visible, filtered.length)} / {filtered.length})
            </span>
          </button>
        </div>
      ) : null}
    </section>
  );
}
