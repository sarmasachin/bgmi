"use client";

import type { Gta6PageContent } from "@/src/lib/gta6PageTypes";
import { GtaAdd, GtaBlock, GtaField, GtaRemove } from "./gta6AdminFields";

type Patch = (updater: (page: Gta6PageContent) => Gta6PageContent) => void;

export function AdminGta6CheatRows({ page, onPatch }: { page: Gta6PageContent; onPatch: Patch }) {
  const rows = page.cheat.rows;
  return (
    <GtaBlock title="Cheat table">
      {rows.map((row, index) =>
        row.kind === "group" ? (
          <div key={`group-${index}`} style={{ marginBottom: 12 }}>
            <GtaField
              label="Group"
              value={row.label}
              onChange={(label) =>
                onPatch((p) => ({
                  ...p,
                  cheat: {
                    ...p.cheat,
                    rows: p.cheat.rows.map((item, i) =>
                      i === index && item.kind === "group" ? { ...item, label } : item,
                    ),
                  },
                }))
              }
            />
            <GtaField
              label="Filter button"
              value={row.filterLabel}
              onChange={(filterLabel) =>
                onPatch((p) => ({
                  ...p,
                  cheat: {
                    ...p.cheat,
                    rows: p.cheat.rows.map((item, i) =>
                      i === index && item.kind === "group" ? { ...item, filterLabel } : item,
                    ),
                  },
                }))
              }
            />
            <GtaRemove
              onClick={() =>
                onPatch((p) => ({ ...p, cheat: { ...p.cheat, rows: p.cheat.rows.filter((_, i) => i !== index) } }))
              }
            />
          </div>
        ) : (
          <div key={`cheat-${index}`} style={{ marginBottom: 12 }}>
            <GtaField
              label="Effect"
              value={row.name}
              onChange={(name) =>
                onPatch((p) => ({
                  ...p,
                  cheat: {
                    ...p.cheat,
                    rows: p.cheat.rows.map((item, i) =>
                      i === index && item.kind === "cheat" ? { ...item, name } : item,
                    ),
                  },
                }))
              }
            />
            <GtaField
              label="PS5"
              value={row.ps5}
              onChange={(ps5) =>
                onPatch((p) => ({
                  ...p,
                  cheat: {
                    ...p.cheat,
                    rows: p.cheat.rows.map((item, i) =>
                      i === index && item.kind === "cheat" ? { ...item, ps5 } : item,
                    ),
                  },
                }))
              }
            />
            <GtaField
              label="Xbox"
              value={row.xbox}
              onChange={(xbox) =>
                onPatch((p) => ({
                  ...p,
                  cheat: {
                    ...p.cheat,
                    rows: p.cheat.rows.map((item, i) =>
                      i === index && item.kind === "cheat" ? { ...item, xbox } : item,
                    ),
                  },
                }))
              }
            />
            <GtaField
              label="PC"
              value={row.pc}
              onChange={(pc) =>
                onPatch((p) => ({
                  ...p,
                  cheat: {
                    ...p.cheat,
                    rows: p.cheat.rows.map((item, i) =>
                      i === index && item.kind === "cheat" ? { ...item, pc } : item,
                    ),
                  },
                }))
              }
            />
            <GtaRemove
              onClick={() =>
                onPatch((p) => ({ ...p, cheat: { ...p.cheat, rows: p.cheat.rows.filter((_, i) => i !== index) } }))
              }
            />
          </div>
        ),
      )}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <GtaAdd
          label="Add group"
          onClick={() =>
            onPatch((p) => ({
              ...p,
              cheat: {
                ...p.cheat,
                rows: [...p.cheat.rows, { kind: "group", label: "", filterLabel: "" }],
              },
            }))
          }
        />
        <GtaAdd
          label="Add cheat"
          onClick={() =>
            onPatch((p) => ({
              ...p,
              cheat: {
                ...p.cheat,
                rows: [...p.cheat.rows, { kind: "cheat", name: "", ps5: "", xbox: "", pc: "" }],
              },
            }))
          }
        />
      </div>
    </GtaBlock>
  );
}
