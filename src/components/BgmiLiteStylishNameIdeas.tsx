"use client";

import { useState } from "react";
import { STYLISH_READY_IDEAS } from "@/src/lib/bgmiLiteStylishNameContent";

/** Compact ready-idea tabs with tap-to-copy (mobile). */
export function BgmiLiteStylishNameIdeas({ heading }: { heading: string }) {
  const [tab, setTab] = useState(STYLISH_READY_IDEAS[0]?.tab ?? "Clean");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const active = STYLISH_READY_IDEAS.find((g) => g.tab === tab) ?? STYLISH_READY_IDEAS[0];

  async function onCopy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1400);
    } catch {
      /* ignore — user can long-press */
    }
  }

  if (!active) return null;

  return (
    <section className="lite-stylish-ideas" aria-labelledby="lite-stylish-ideas-title">
      <h2 id="lite-stylish-ideas-title" className="lite-stylish-section-title">
        {heading}
      </h2>
      <div className="lite-stylish-idea-tabs" role="tablist">
        {STYLISH_READY_IDEAS.map((g) => (
          <button
            key={g.tab}
            type="button"
            role="tab"
            aria-selected={tab === g.tab}
            className={`lite-stylish-chip${tab === g.tab ? " is-on" : ""}`}
            onClick={() => setTab(g.tab)}
          >
            {g.tab}
          </button>
        ))}
      </div>
      <div className="lite-stylish-idea-grid" role="list">
        {active.items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="listitem"
            className={`lite-stylish-idea-card${copiedId === item.id ? " is-done" : ""}`}
            onClick={() => void onCopy(item.id, item.value)}
          >
            <span className="lite-stylish-idea-value">{item.value}</span>
            <span className="lite-stylish-idea-meta">
              {copiedId === item.id ? "Copied" : item.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
