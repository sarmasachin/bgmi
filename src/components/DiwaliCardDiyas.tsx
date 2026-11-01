"use client";

import { useState, type MouseEvent } from "react";
import { DiwaliDiya } from "@/src/components/DiwaliDiya";
import { SHOW_DIWALI_DIYAS } from "@/src/lib/diwaliDecor";
import "@/src/components/diwaliDiya.css";

function InteractiveDiya({ side }: { side: "left" | "right" }) {
  const [lit, setLit] = useState(true);

  function onToggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setLit((prev) => !prev);
  }

  return (
    <button
      type="button"
      className={`diya diya--${side}${lit ? "" : " is-out"}`}
      aria-label={lit ? "Diya — click to extinguish" : "Diya — click to light again"}
      aria-pressed={lit}
      title={lit ? "Click to extinguish" : "Click to light"}
      onClick={onToggle}
    >
      <DiwaliDiya />
    </button>
  );
}

/** Two diyas for a card’s top-left / top-right border. Parent must be position:relative. */
export function DiwaliCardDiyas() {
  if (!SHOW_DIWALI_DIYAS) return null;
  return (
    <>
      <InteractiveDiya side="left" />
      <InteractiveDiya side="right" />
    </>
  );
}

/** Append Diwali layout class when decorations are on. */
export function withDiwaliClass(base: string, diwaliClass: string): string {
  return SHOW_DIWALI_DIYAS ? `${base} ${diwaliClass}` : base;
}
