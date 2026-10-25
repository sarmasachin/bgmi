"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Mount children only on mobile viewports — avoids desktop ad requests. */
export function MobileOnlyAd({
  children,
  maxWidthPx = 720,
}: {
  children: ReactNode;
  maxWidthPx?: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidthPx}px)`);
    const apply = () => setShow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [maxWidthPx]);

  if (!show) return null;
  return <div className="ffc-ad-above-trust">{children}</div>;
}
