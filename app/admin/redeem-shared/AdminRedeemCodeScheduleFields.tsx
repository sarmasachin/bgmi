"use client";

import {
  formatRedeemExpiredOnLabel,
  formatRedeemExpiresLabel,
  formatRedeemReleasedLabel,
  isRedeemCodeScheduled,
  joinRedeemScheduleIso,
  splitRedeemScheduleIso,
  type RedeemScheduleDraft,
} from "@/src/lib/redeemCodeSchedule";

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
} as const;

type Props = {
  draft: RedeemScheduleDraft;
  onPatch: (patch: Partial<RedeemScheduleDraft>) => void;
};

function DateTimePair({
  label,
  iso,
  onIsoChange,
}: {
  label: string;
  iso: string | undefined;
  onIsoChange: (iso: string) => void;
}) {
  const { date, time } = splitRedeemScheduleIso(iso);

  function update(nextDate: string, nextTime: string) {
    if (!nextDate.trim()) {
      onIsoChange("");
      return;
    }
    const joined = joinRedeemScheduleIso(nextDate, nextTime);
    if (!joined) return;
    onIsoChange(joined);
  }

  return (
    <div className="admin-redeem-schedule-block">
      <span className="admin-redeem-schedule-label">{label}</span>
      <div className="admin-redeem-schedule-grid">
        <label className="admin-redeem-field">
          <span>Date (IST)</span>
          <input
            type="date"
            value={date}
            onChange={(e) => update(e.target.value, time)}
            style={fieldStyle}
          />
        </label>
        <label className="admin-redeem-field">
          <span>Time (IST)</span>
          <input
            type="time"
            value={time}
            onChange={(e) => update(date, e.target.value)}
            style={fieldStyle}
          />
        </label>
      </div>
    </div>
  );
}

/** Live / expired redeem-code date pickers with auto-formatted public labels. */
export function AdminRedeemCodeScheduleFields({ draft, onPatch }: Props) {
  const scheduled =
    draft.status === "live" ? isRedeemCodeScheduled(draft as RedeemScheduleDraft & { status: "live" | "expired" }) : false;

  if (draft.status === "live") {
    return (
      <div className="admin-redeem-schedule-section">
        <div className="admin-redeem-schedule-heading">
          <strong>Schedule</strong>
          <span>
            Set dates only if you want them on the public page. Leave empty to hide Released / Expires
            text.
          </span>
        </div>
        {scheduled ? (
          <p className="admin-redeem-schedule-banner" role="status">
            Scheduled — hidden on the public page until Go-live time.
          </p>
        ) : null}
        <DateTimePair
          label="Go live (Released)"
          iso={draft.releasedAt}
          onIsoChange={(releasedAt) =>
            onPatch(
              releasedAt
                ? { releasedAt, releasedLabel: formatRedeemReleasedLabel(releasedAt) }
                : { releasedAt: undefined, releasedLabel: undefined },
            )
          }
        />
        <p className="admin-redeem-schedule-preview">
          {draft.releasedLabel || "Optional — empty hides Released text"}
        </p>

        <DateTimePair
          label="Expires"
          iso={draft.expiresAt}
          onIsoChange={(expiresAt) =>
            onPatch(
              expiresAt
                ? { expiresAt, expiresLabel: formatRedeemExpiresLabel(expiresAt) }
                : { expiresAt: undefined, expiresLabel: undefined },
            )
          }
        />
        <p className="admin-redeem-schedule-preview">
          {draft.expiresLabel || "Optional — empty hides Expires text"}
        </p>
      </div>
    );
  }

  return (
    <div className="admin-redeem-schedule-section">
      <div className="admin-redeem-schedule-heading">
        <strong>Schedule</strong>
        <span>When this code was marked expired (IST).</span>
      </div>
      <DateTimePair
        label="Expired on"
        iso={draft.expiredOnAt}
        onIsoChange={(expiredOnAt) =>
          onPatch(
            expiredOnAt
              ? { expiredOnAt, expiredOnLabel: formatRedeemExpiredOnLabel(expiredOnAt) }
              : { expiredOnAt: undefined, expiredOnLabel: undefined },
          )
        }
      />
      <p className="admin-redeem-schedule-preview">
        {draft.expiredOnLabel || "Optional — empty hides Expired on text"}
      </p>
    </div>
  );
}
