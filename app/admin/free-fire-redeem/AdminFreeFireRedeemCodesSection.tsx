"use client";

import type { FreeFireRedeemCodeItem } from "@/src/lib/freeFireRedeemCodes";
import {
  FREE_FIRE_REDEEM_SERVERS,
  coerceFreeFireRedeemServer,
  type FreeFireRedeemServerId,
} from "@/src/lib/freeFireRedeemServers";

const selectStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
} as const;

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #334155",
          background: "#0f172a",
          color: "#e2e8f0",
        }}
      />
    </label>
  );
}

export function emptyFreeFireRedeemCode(): FreeFireRedeemCodeItem {
  return {
    id: `new-${Date.now()}`,
    title: "New redeem code",
    code: "CODE-HERE",
    status: "live",
    server: "global",
    releasedLabel: "Released: ",
    expiresLabel: "Expires: ",
  };
}

type Props = {
  codes: FreeFireRedeemCodeItem[];
  onPatchCode: (index: number, patch: Partial<FreeFireRedeemCodeItem>) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
};

/** Admin editor for Free Fire redeem codes (includes per-code server). */
export function AdminFreeFireRedeemCodesSection({
  codes,
  onPatchCode,
  onRemove,
  onAdd,
}: Props) {
  return (
    <>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "#94a3b8", lineHeight: 1.45 }}>
        Set <strong>Server</strong> per code. Public page tabs filter by region;{" "}
        <strong>Global</strong> codes also appear on every regional tab.
      </p>
      {codes.map((item, index) => (
        <div
          key={item.id}
          style={{
            border: "1px solid #334155",
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
            background: "#0b1220",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
            <strong style={{ color: "#e2e8f0" }}>Code #{index + 1}</strong>
            <button
              type="button"
              className="admin-news-btn admin-news-btn-edit"
              onClick={() => onRemove(index)}
              disabled={codes.length <= 1}
            >
              Remove
            </button>
          </div>
          <Field label="Title" value={item.title} onChange={(title) => onPatchCode(index, { title })} />
          <Field label="Code" value={item.code} onChange={(code) => onPatchCode(index, { code })} />
          <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>Server / region</span>
            <select
              value={coerceFreeFireRedeemServer(item.server)}
              onChange={(e) =>
                onPatchCode(index, {
                  server: e.target.value as FreeFireRedeemServerId,
                })
              }
              style={selectStyle}
            >
              {FREE_FIRE_REDEEM_SERVERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>Status</span>
            <select
              value={item.status}
              onChange={(e) =>
                onPatchCode(index, {
                  status: e.target.value === "expired" ? "expired" : "live",
                })
              }
              style={selectStyle}
            >
              <option value="live">LIVE</option>
              <option value="expired">EXPIRED</option>
            </select>
          </label>
          {item.status === "live" ? (
            <>
              <Field
                label="Released label"
                value={item.releasedLabel ?? ""}
                onChange={(releasedLabel) => onPatchCode(index, { releasedLabel })}
              />
              <Field
                label="Expires label"
                value={item.expiresLabel ?? ""}
                onChange={(expiresLabel) => onPatchCode(index, { expiresLabel })}
              />
            </>
          ) : (
            <Field
              label="Expired on label"
              value={item.expiredOnLabel ?? ""}
              onChange={(expiredOnLabel) => onPatchCode(index, { expiredOnLabel })}
            />
          )}
        </div>
      ))}
      <button type="button" className="admin-news-btn admin-news-btn-edit" onClick={onAdd}>
        Add code
      </button>
    </>
  );
}
