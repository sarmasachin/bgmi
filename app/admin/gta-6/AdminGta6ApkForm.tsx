"use client";

import type { Gta6PageContent } from "@/src/lib/gta6PageTypes";
import { GtaAdd, GtaBlock, GtaField, GtaLines, GtaRemove } from "./gta6AdminFields";

type Patch = (updater: (page: Gta6PageContent) => Gta6PageContent) => void;

export function AdminGta6ApkForm({ page, onPatch }: { page: Gta6PageContent; onPatch: Patch }) {
  const apk = page.apk;
  function setApk(partial: Partial<Gta6PageContent["apk"]>) {
    onPatch((prev) => ({ ...prev, apk: { ...prev.apk, ...partial } }));
  }

  return (
    <GtaBlock title="GT6 APK article">
      <p style={{ margin: "0 0 12px", color: "#94a3b8", fontSize: 13 }}>
        This page stays an article. There is no download button.
      </p>
      <GtaField label="SEO title" value={apk.seoTitle} onChange={(seoTitle) => setApk({ seoTitle })} />
      <GtaField
        label="Meta description"
        value={apk.seoDescription}
        multiline
        onChange={(seoDescription) => setApk({ seoDescription })}
      />
      <GtaField label="Heading" value={apk.title} onChange={(title) => setApk({ title })} />
      <GtaField label="Last updated" value={apk.updated} onChange={(updated) => setApk({ updated })} />
      <GtaLines label="Intro paragraphs (one per line)" lines={apk.intro} onChange={(intro) => setApk({ intro })} />
      {apk.sections.map((section, index) => (
        <div key={`apk-section-${index}`} style={{ marginBottom: 12 }}>
          <GtaField
            label="Section heading"
            value={section.h2}
            onChange={(h2) =>
              onPatch((p) => ({
                ...p,
                apk: {
                  ...p.apk,
                  sections: p.apk.sections.map((item, i) => (i === index ? { ...item, h2 } : item)),
                },
              }))
            }
          />
          <GtaLines
            label="Paragraphs"
            lines={section.paragraphs}
            onChange={(paragraphs) =>
              onPatch((p) => ({
                ...p,
                apk: {
                  ...p.apk,
                  sections: p.apk.sections.map((item, i) => (i === index ? { ...item, paragraphs } : item)),
                },
              }))
            }
          />
          <GtaRemove
            onClick={() =>
              onPatch((p) => ({ ...p, apk: { ...p.apk, sections: p.apk.sections.filter((_, i) => i !== index) } }))
            }
          />
        </div>
      ))}
      <GtaAdd
        label="Add section"
        onClick={() =>
          onPatch((p) => ({ ...p, apk: { ...p.apk, sections: [...p.apk.sections, { h2: "", paragraphs: [] }] } }))
        }
      />
    </GtaBlock>
  );
}
