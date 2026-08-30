"use client";

import type {
  FreeFireStylishNameIdeaGroup,
  FreeFireStylishNamePageContent,
} from "@/src/lib/freeFireStylishNamePage";

const fieldStyle = {
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
  multiline,
  rows = 2,
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
          style={{ ...fieldStyle, resize: "vertical" }}
        />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} style={fieldStyle} />
      )}
    </label>
  );
}

type Props = {
  page: FreeFireStylishNamePageContent;
  onPatch: (
    updater: (prev: FreeFireStylishNamePageContent) => FreeFireStylishNamePageContent,
  ) => void;
};

function emptyGroup(): FreeFireStylishNameIdeaGroup {
  return {
    tab: "New tab",
    items: [{ id: `idea-${Date.now()}`, label: "Label", value: "★Name★" }],
  };
}

/** Admin editor for Free Fire ready-name idea tabs + chips. */
export function AdminFreeFireStylishIdeasSection({ page, onPatch }: Props) {
  function patchGroup(gi: number, patch: Partial<FreeFireStylishNameIdeaGroup>) {
    onPatch((prev) => ({
      ...prev,
      ideaGroups: prev.ideaGroups.map((g, i) => (i === gi ? { ...g, ...patch } : g)),
    }));
  }

  function patchItem(
    gi: number,
    ii: number,
    patch: Partial<FreeFireStylishNameIdeaGroup["items"][number]>,
  ) {
    onPatch((prev) => ({
      ...prev,
      ideaGroups: prev.ideaGroups.map((g, i) => {
        if (i !== gi) return g;
        return {
          ...g,
          items: g.items.map((item, j) => (j === ii ? { ...item, ...patch } : item)),
        };
      }),
    }));
  }

  return (
    <>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "#94a3b8", lineHeight: 1.45 }}>
        Public page “Quick name ideas” chips. Each tab can hold multiple copyable names.
      </p>
      <Field
        label="Ideas section heading"
        value={page.ideasHeading}
        onChange={(ideasHeading) => onPatch((p) => ({ ...p, ideasHeading }))}
      />
      {page.ideaGroups.map((group, gi) => (
        <div
          key={`group-${gi}-${group.tab}`}
          style={{
            border: "1px solid #334155",
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
            background: "#0b1220",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
            <strong style={{ color: "#e2e8f0" }}>Tab #{gi + 1}</strong>
            <button
              type="button"
              className="admin-news-btn admin-news-btn-edit"
              onClick={() =>
                onPatch((p) => ({
                  ...p,
                  ideaGroups: p.ideaGroups.filter((_, i) => i !== gi),
                }))
              }
              disabled={page.ideaGroups.length <= 1}
            >
              Remove tab
            </button>
          </div>
          <Field label="Tab label" value={group.tab} onChange={(tab) => patchGroup(gi, { tab })} />
          {group.items.map((item, ii) => (
            <div
              key={item.id}
              style={{
                border: "1px dashed #334155",
                borderRadius: 8,
                padding: 10,
                marginBottom: 10,
                background: "#020617",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Chip #{ii + 1}</span>
                <button
                  type="button"
                  className="admin-news-btn admin-news-btn-edit"
                  onClick={() =>
                    onPatch((p) => ({
                      ...p,
                      ideaGroups: p.ideaGroups.map((g, i) =>
                        i === gi
                          ? { ...g, items: g.items.filter((_, j) => j !== ii) }
                          : g,
                      ),
                    }))
                  }
                  disabled={group.items.length <= 1}
                >
                  Remove
                </button>
              </div>
              <Field
                label="Display label"
                value={item.label}
                onChange={(label) => patchItem(gi, ii, { label })}
              />
              <Field
                label="Copy value (stylish name)"
                value={item.value}
                onChange={(value) => patchItem(gi, ii, { value })}
              />
            </div>
          ))}
          <button
            type="button"
            className="admin-news-btn admin-news-btn-edit"
            onClick={() =>
              onPatch((p) => ({
                ...p,
                ideaGroups: p.ideaGroups.map((g, i) =>
                  i === gi
                    ? {
                        ...g,
                        items: [
                          ...g.items,
                          {
                            id: `idea-${Date.now()}`,
                            label: "New",
                            value: "★New★",
                          },
                        ],
                      }
                    : g,
                ),
              }))
            }
          >
            Add chip
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin-news-btn admin-news-btn-edit"
        onClick={() => onPatch((p) => ({ ...p, ideaGroups: [...p.ideaGroups, emptyGroup()] }))}
      >
        Add tab
      </button>
    </>
  );
}
