"use client";

import type {
  PubgMobileLiteApkPageContent,
  PubgMobileLiteApkPageSectionId,
} from "@/src/lib/pubgMobileLiteApkPage";
import { AdminAccordionSection, AdminField, AdminLinesEditor } from "./adminPubgMobileLiteApkFields";

type Props = {
  page: PubgMobileLiteApkPageContent;
  openIds: Set<PubgMobileLiteApkPageSectionId>;
  onToggle: (id: PubgMobileLiteApkPageSectionId) => void;
  onPatch: (updater: (prev: PubgMobileLiteApkPageContent) => PubgMobileLiteApkPageContent) => void;
};

/** Admin editors for install / pre-register steps and facts table. */
export function AdminPubgMobileLiteApkFormInfo({ page, openIds, onToggle, onPatch }: Props) {
  return (
    <>
      <AdminAccordionSection
        id="install"
        title="Pre-register / install"
        open={openIds.has("install")}
        onToggle={onToggle}
      >
        <AdminField
          label="Section title"
          value={page.install.title}
          onChange={(title) => onPatch((p) => ({ ...p, install: { ...p.install, title } }))}
        />
        <AdminField
          label="Intro"
          value={page.install.intro}
          multiline
          rows={4}
          onChange={(intro) => onPatch((p) => ({ ...p, install: { ...p.install, intro } }))}
        />
        <AdminLinesEditor
          label="Steps"
          lines={page.install.steps}
          onChange={(steps) => onPatch((p) => ({ ...p, install: { ...p.install, steps } }))}
        />
        <AdminField
          label="Guide link"
          value={page.install.guideHref}
          onChange={(guideHref) =>
            onPatch((p) => ({ ...p, install: { ...p.install, guideHref } }))
          }
        />
        <AdminField
          label="Guide label"
          value={page.install.guideLabel}
          onChange={(guideLabel) =>
            onPatch((p) => ({ ...p, install: { ...p.install, guideLabel } }))
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
            key={`fact-row-${index}`}
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
              facts: {
                ...p.facts,
                rows: [...p.facts.rows, { label: "New row", value: "Add details" }],
              },
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
