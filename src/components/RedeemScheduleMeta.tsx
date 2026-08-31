"use client";

import { compactRedeemScheduleLabel } from "@/src/lib/redeemCodeSchedule";

type Props = {
  icon: string;
  label?: string;
};

/** Full schedule label on desktop; compact text on mobile (see globals.css). */
export function RedeemScheduleMeta({ icon, label }: Props) {
  if (!label?.trim()) return null;
  const trimmed = label.trim();
  const compact = compactRedeemScheduleLabel(label);
  return (
    <span className="lite-redeem-meta-item" aria-label={trimmed}>
      <i className={`fa-solid ${icon}`} aria-hidden />
      <span className="lite-redeem-meta-full">{trimmed}</span>
      <span className="lite-redeem-meta-short" aria-hidden="true">
        {compact}
      </span>
    </span>
  );
}
