"use client";

import type { CSSProperties, ReactNode } from "react";

const controlStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
};

export function GtaField({
  label,
  value,
  onChange,
  multiline,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          rows={rows}
          onChange={(event) => onChange(event.target.value)}
          style={{ ...controlStyle, resize: "vertical" }}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          style={controlStyle}
        />
      )}
    </label>
  );
}

export function GtaLines({
  label,
  lines,
  onChange,
}: {
  label: string;
  lines: string[];
  onChange: (lines: string[]) => void;
}) {
  return (
    <GtaField
      label={label}
      value={lines.join("\n")}
      multiline
      rows={Math.min(14, Math.max(3, lines.length + 1))}
      onChange={(value) => onChange(value.split("\n"))}
    />
  );
}

export function GtaBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset
      style={{
        border: "1px solid #1e293b",
        borderRadius: 12,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <legend style={{ padding: "0 8px", color: "#e2e8f0", fontSize: 14 }}>{title}</legend>
      {children}
    </fieldset>
  );
}

export function GtaAdd({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="admin-news-btn admin-news-btn-edit" onClick={onClick}>
      {label}
    </button>
  );
}

export function GtaRemove({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="admin-news-btn" onClick={onClick}>
      Remove
    </button>
  );
}
