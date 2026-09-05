"use client";

import type { CSSProperties, ReactNode } from "react";
import type { BgmiLiteApkPageSectionId } from "@/src/lib/bgmiLiteBetaApkPage";

const controlStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
};

export function AdminField({
  label,
  value,
  onChange,
  multiline,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          style={{ ...controlStyle, resize: "vertical" }}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} style={controlStyle} />
      )}
    </label>
  );
}

export function AdminLinesEditor({
  label,
  lines,
  onChange,
}: {
  label: string;
  lines: string[];
  onChange: (lines: string[]) => void;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{label}</div>
      {lines.map((line, index) => (
        <div key={`${label}-${index}`} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            value={line}
            onChange={(e) => {
              const next = [...lines];
              next[index] = e.target.value;
              onChange(next);
            }}
            style={{ ...controlStyle, flex: 1, width: "auto" }}
          />
          <button
            type="button"
            className="admin-news-btn admin-news-btn-edit"
            onClick={() => onChange(lines.filter((_, i) => i !== index))}
            disabled={lines.length <= 1}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-news-btn admin-news-btn-edit"
        onClick={() => onChange([...lines, ""])}
      >
        Add line
      </button>
    </div>
  );
}

export function AdminAccordionSection({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: BgmiLiteApkPageSectionId;
  title: string;
  open: boolean;
  onToggle: (id: BgmiLiteApkPageSectionId) => void;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #1e293b",
        borderRadius: 12,
        marginBottom: 10,
        background: "#0b1220",
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(id)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 14px",
          background: "transparent",
          border: 0,
          color: "#e2e8f0",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        <span>{title}</span>
        <span style={{ color: "#67e8f9", fontSize: 12 }}>{open ? "Hide" : "Show"}</span>
      </button>
      {open ? <div style={{ padding: "0 14px 14px" }}>{children}</div> : null}
    </div>
  );
}

function splitCountdownIso(iso: string): { date: string; time: string } {
  const fallback = { date: "", time: "00:00" };
  const trimmed = iso.trim();
  if (!trimmed) return fallback;
  const match = trimmed.match(
    /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/,
  );
  if (match) return { date: match[1], time: `${match[2]}:${match[3]}` };
  const ms = Date.parse(trimmed);
  if (!Number.isFinite(ms)) return fallback;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(ms));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

function joinCountdownIso(date: string, time: string): string {
  const safeDate = date.trim();
  const safeTime = (time.trim() || "00:00").slice(0, 5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(safeDate)) return "";
  if (!/^\d{2}:\d{2}$/.test(safeTime)) return `${safeDate}T00:00:00+05:30`;
  return `${safeDate}T${safeTime}:00+05:30`;
}

export function AdminCountdownTarget({
  targetIso,
  onChange,
}: {
  targetIso: string;
  onChange: (iso: string) => void;
}) {
  const { date, time } = splitCountdownIso(targetIso);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.8fr)", gap: 12, marginBottom: 12 }}>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>Target date (IST)</span>
        <input
          type="date"
          value={date}
          onChange={(e) => onChange(joinCountdownIso(e.target.value, time) || targetIso)}
          style={controlStyle}
        />
      </label>
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>Time (IST)</span>
        <input
          type="time"
          value={time}
          onChange={(e) => onChange(joinCountdownIso(date, e.target.value) || targetIso)}
          style={controlStyle}
        />
      </label>
    </div>
  );
}
