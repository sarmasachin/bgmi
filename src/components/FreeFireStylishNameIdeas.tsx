"use client";

import { useMemo, useState } from "react";
import type { FreeFireStylishNameIdeaGroup } from "@/src/lib/freeFireStylishNamePage";

type Props = {
  heading: string;
  groups: FreeFireStylishNameIdeaGroup[];
};

async function copyText(value: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  throw new Error("Clipboard unavailable");
}

/** Free Fire ready-idea tabs with tap-to-copy — data from CMS. */
export function FreeFireStylishNameIdeas({ heading, groups }: Props) {
  const safeGroups = useMemo(
    () =>
      (Array.isArray(groups) ? groups : [])
        .map((g) => ({
          tab: typeof g?.tab === "string" ? g.tab.trim() : "",
          items: Array.isArray(g?.items)
            ? g.items.filter((item) => item?.value && String(item.value).trim())
            : [],
        }))
        .filter((g) => g.tab && g.items.length > 0),
    [groups],
  );

  const [tab, setTab] = useState(safeGroups[0]?.tab ?? "");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyErrorId, setCopyErrorId] = useState<string | null>(null);
  const active = safeGroups.find((g) => g.tab === tab) ?? safeGroups[0] ?? null;

  async function onCopy(id: string, value: string) {
    setCopyErrorId(null);
    try {
      await copyText(value);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1400);
    } catch {
      setCopiedId(null);
      setCopyErrorId(id);
      window.setTimeout(() => setCopyErrorId(null), 2200);
    }
  }

  if (!active) return null;

  return (
    <section className="lite-stylish-ideas" aria-labelledby="ff-stylish-ideas-title">
      <h2 id="ff-stylish-ideas-title" className="lite-stylish-section-title">
        {heading}
      </h2>
      <div className="lite-stylish-idea-tabs" role="tablist" aria-label="Name idea categories">
        {safeGroups.map((g) => (
          <button
            key={g.tab}
            type="button"
            role="tab"
            aria-selected={(tab || active.tab) === g.tab}
            className={`lite-stylish-chip${(tab || active.tab) === g.tab ? " is-on" : ""}`}
            onClick={() => setTab(g.tab)}
          >
            {g.tab}
          </button>
        ))}
      </div>
      <div className="lite-stylish-idea-grid" role="list">
        {active.items.map((item) => {
          const id = item.id || item.value;
          const failed = copyErrorId === id;
          const done = copiedId === id;
          return (
            <button
              key={id}
              type="button"
              role="listitem"
              className={`lite-stylish-idea-card${done ? " is-done" : ""}${failed ? " is-error" : ""}`}
              onClick={() => void onCopy(id, item.value)}
              aria-label={failed ? `Copy failed for ${item.label}` : `Copy ${item.value}`}
            >
              <span className="lite-stylish-idea-value">{item.value}</span>
              <span className="lite-stylish-idea-meta">
                {failed ? "Copy failed" : done ? "Copied" : item.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
