"use client";

import type { BgmiLiteApkPageSectionId, BgmiLiteBetaApkPageContent } from "@/src/lib/bgmiLiteBetaApkPage";
import { AdminAccordionSection, AdminField, AdminLinesEditor } from "./adminBgmiLiteApkFields";

type Props = {
  page: BgmiLiteBetaApkPageContent;
  openIds: Set<BgmiLiteApkPageSectionId>;
  onToggle: (id: BgmiLiteApkPageSectionId) => void;
  onPatch: (updater: (prev: BgmiLiteBetaApkPageContent) => BgmiLiteBetaApkPageContent) => void;
};

export function AdminBgmiLiteApkFormInfo({ page, openIds, onToggle, onPatch }: Props) {
  return (
    <>
      <AdminAccordionSection
        id="preRegister"
        title="Pre-register"
        open={openIds.has("preRegister")}
        onToggle={onToggle}
      >
        <AdminField
          label="Section title"
          value={page.preRegister.title}
          onChange={(title) =>
            onPatch((p) => ({ ...p, preRegister: { ...p.preRegister, title } }))
          }
        />
        <AdminField
          label="Intro"
          value={page.preRegister.intro}
          multiline
          rows={4}
          onChange={(intro) =>
            onPatch((p) => ({ ...p, preRegister: { ...p.preRegister, intro } }))
          }
        />
        <AdminLinesEditor
          label="Steps"
          lines={page.preRegister.steps}
          onChange={(steps) =>
            onPatch((p) => ({ ...p, preRegister: { ...p.preRegister, steps } }))
          }
        />
        <AdminField
          label="Guide link"
          value={page.preRegister.guideHref}
          onChange={(guideHref) =>
            onPatch((p) => ({ ...p, preRegister: { ...p.preRegister, guideHref } }))
          }
        />
        <AdminField
          label="Guide label"
          value={page.preRegister.guideLabel}
          onChange={(guideLabel) =>
            onPatch((p) => ({ ...p, preRegister: { ...p.preRegister, guideLabel } }))
          }
        />
      </AdminAccordionSection>

      <AdminAccordionSection id="facts" title="Facts table" open={openIds.has("facts")} onToggle={onToggle}>
        <AdminField
          label="Section title"
          value={page.facts.title}
          onChange={(title) => onPatch((p) => ({ ...p, facts: { ...p.facts, title } }))}
        />
        {page.facts.rows.map((row, index) => (
          <div
            key={`${row.label}-${index}`}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.4fr) auto",
              gap: 8,
              marginBottom: 8,
              alignItems: "start",
            }}
          >
            <AdminField
              label={index === 0 ? "Label" : ""}
              value={row.label}
              onChange={(label) =>
                onPatch((p) => ({
                  ...p,
                  facts: {
                    ...p.facts,
                    rows: p.facts.rows.map((r, i) => (i === index ? { ...r, label } : r)),
                  },
                }))
              }
            />
            <AdminField
              label={index === 0 ? "Value" : ""}
              value={row.value}
              onChange={(value) =>
                onPatch((p) => ({
                  ...p,
                  facts: {
                    ...p.facts,
                    rows: p.facts.rows.map((r, i) => (i === index ? { ...r, value } : r)),
                  },
                }))
              }
            />
            <button
              type="button"
              className="admin-news-btn admin-news-btn-edit"
              style={{ marginTop: index === 0 ? 22 : 0 }}
              disabled={page.facts.rows.length <= 1}
              onClick={() =>
                onPatch((p) => ({
                  ...p,
                  facts: { ...p.facts, rows: p.facts.rows.filter((_, i) => i !== index) },
                }))
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="admin-news-btn admin-news-btn-edit"
          onClick={() =>
            onPatch((p) => ({
              ...p,
              facts: { ...p.facts, rows: [...p.facts.rows, { label: "New row", value: "Add details" }] },
            }))
          }
        >
          Add fact row
        </button>
        <AdminField
          label="Note under table"
          value={page.facts.note}
          multiline
          onChange={(note) => onPatch((p) => ({ ...p, facts: { ...p.facts, note } }))}
        />
      </AdminAccordionSection>
    </>
  );
}
