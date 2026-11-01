"use client";

import { useId } from "react";

/** Decorative Diwali diya — SVG so it stays sharp on dark calculator UI. */
export function DiwaliDiya({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const glow = `diyaGradGlow-${uid}`;
  const clay = `diyaGradClay-${uid}`;
  const flame = `diyaGradFlame-${uid}`;

  return (
    <svg
      className={className}
      viewBox="0 0 64 72"
      width="64"
      height="72"
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id={glow} cx="50%" cy="48%" r="62%">
          <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.32" />
          <stop offset="35%" stopColor="#fef3c7" stopOpacity="0.18" />
          <stop offset="65%" stopColor="#fde68a" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={clay} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fdba74" />
          <stop offset="45%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
        <linearGradient id={flame} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="40%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="36" rx="30" ry="32" fill={`url(#${glow})`} className="diya-glow" />
      <path
        className="diya-flame"
        d="M32 8c4 8 10 12 10 20 0 7-4.5 12-10 12s-10-5-10-12c0-8 6-12 10-20z"
        fill={`url(#${flame})`}
      />
      <path
        className="diya-flame-core"
        d="M32 18c2 4 5 6 5 11 0 3.5-2.2 6-5 6s-5-2.5-5-6c0-5 3-7 5-11z"
        fill="#fff7ed"
        opacity="0.95"
      />
      <ellipse cx="32" cy="52" rx="22" ry="8" fill={`url(#${clay})`} />
      <path
        d="M10 52c2 10 12 16 22 16s20-6 22-16c-4 4-12 7-22 7s-18-3-22-7z"
        fill="#9a3412"
        opacity="0.9"
      />
      <ellipse cx="32" cy="50" rx="16" ry="4.5" fill="#7c2d12" />
      <ellipse cx="32" cy="49" rx="10" ry="2.2" fill="#fbbf24" opacity="0.85" />
    </svg>
  );
}
