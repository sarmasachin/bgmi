import type { ReactNode } from "react";

/**
 * Keeps children in the HTML (so enabled slots actually mount).
 * Desktop is CSS-hidden; AdSlotClient skips AdSense push off mobile.
 */
export function MobileOnlyAd({
  children,
  maxWidthPx = 720,
}: {
  children: ReactNode;
  maxWidthPx?: number;
}) {
  return (
    <div
      className="ffc-ad-above-trust"
      data-mobile-only-ad=""
      data-mobile-max={maxWidthPx}
    >
      {children}
      <style>{`
        @media (min-width: ${maxWidthPx + 1}px) {
          .ffc-ad-above-trust[data-mobile-only-ad] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
