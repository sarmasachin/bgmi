"use client";

import { useEffect, useState } from "react";

type Props = {
  label: string;
  targetIso: string;
  dateText: string;
  /** Shown when the countdown reaches zero. */
  liveMessage?: string;
};

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function splitRemaining(ms: number): Parts | null {
  if (ms <= 0) return null;
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Advance Server hero countdown only — does not affect other pages.
 * Numbers render immediately (no "--" flash). suppressHydrationWarning
 * avoids SSR/client clock second mismatch remount blink.
 */
export function FfAdvanceServerCountdown({
  label,
  targetIso,
  dateText,
  liveMessage = "Advance Server is open — check the publisher portal",
}: Props) {
  const targetMs = Date.parse(targetIso);
  const [parts, setParts] = useState<Parts | null>(() =>
    Number.isFinite(targetMs) ? splitRemaining(targetMs - Date.now()) : null,
  );

  useEffect(() => {
    if (!Number.isFinite(targetMs)) return;
    const tick = () => setParts(splitRemaining(targetMs - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  if (!Number.isFinite(targetMs)) return null;

  return (
    <div className="ff-as-countdown">
      <p className="ff-as-countdown-label">{label}</p>
      {parts ? (
        <div className="ff-as-countdown-units">
          <span className="ff-as-countdown-unit">
            <strong suppressHydrationWarning>{pad(parts.days)}</strong>
            <span>Days</span>
          </span>
          <span className="ff-as-countdown-unit">
            <strong suppressHydrationWarning>{pad(parts.hours)}</strong>
            <span>Hours</span>
          </span>
          <span className="ff-as-countdown-unit">
            <strong suppressHydrationWarning>{pad(parts.minutes)}</strong>
            <span>Mins</span>
          </span>
          <span className="ff-as-countdown-unit">
            <strong suppressHydrationWarning>{pad(parts.seconds)}</strong>
            <span>Secs</span>
          </span>
        </div>
      ) : (
        <p className="ff-as-countdown-live">{liveMessage}</p>
      )}
      <p className="ff-as-countdown-date">{dateText}</p>
    </div>
  );
}
