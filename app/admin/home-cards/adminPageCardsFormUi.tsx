"use client";

import type { HomeCardSectionId } from "@/src/lib/homeCardsTypes";

export function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e2e8f0",
            resize: "vertical",
          }}
        />
      ) : (
        <input
          id={id}
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
      )}
    </label>
  );
}

export function LinesEditor({
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
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#e2e8f0",
            }}
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

export function AccordionSection({
  id,
  label,
  open,
  onToggle,
  children,
}: {
  id: HomeCardSectionId;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px solid #1e293b",
        borderRadius: 12,
        marginBottom: 12,
        overflow: "hidden",
        background: "#0b1220",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`home-card-panel-${id}`}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 16px",
          background: "transparent",
          border: "none",
          color: "#e2e8f0",
          cursor: "pointer",
          textAlign: "left",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <span>{label}</span>
        <span style={{ color: "#94a3b8", fontSize: 12 }}>{open ? "Hide" : "Show"}</span>
      </button>
      {open ? (
        <div id={`home-card-panel-${id}`} style={{ padding: "0 16px 16px" }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
