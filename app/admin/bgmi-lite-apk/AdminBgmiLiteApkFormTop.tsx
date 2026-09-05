"use client";

import type { BgmiLiteApkPageSectionId, BgmiLiteBetaApkPageContent } from "@/src/lib/bgmiLiteBetaApkPage";
import {
  AdminAccordionSection,
  AdminCountdownTarget,
  AdminField,
  AdminLinesEditor,
} from "./adminBgmiLiteApkFields";

type Props = {
  page: BgmiLiteBetaApkPageContent;
  openIds: Set<BgmiLiteApkPageSectionId>;
  onToggle: (id: BgmiLiteApkPageSectionId) => void;
  onPatch: (updater: (prev: BgmiLiteBetaApkPageContent) => BgmiLiteBetaApkPageContent) => void;
};

export function AdminBgmiLiteApkFormTop({ page, openIds, onToggle, onPatch }: Props) {
  return (
    <>
      <AdminAccordionSection id="seo" title="SEO" open={openIds.has("seo")} onToggle={onToggle}>
        <AdminField
          label="SEO title"
          value={page.seoTitle}
          onChange={(seoTitle) => onPatch((p) => ({ ...p, seoTitle }))}
        />
        <AdminField
          label="Meta description"
          value={page.seoDescription}
          multiline
          onChange={(seoDescription) => onPatch((p) => ({ ...p, seoDescription }))}
        />
        <AdminLinesEditor
          label="SEO keywords"
          lines={page.seoKeywords}
          onChange={(seoKeywords) => onPatch((p) => ({ ...p, seoKeywords }))}
        />
      </AdminAccordionSection>

      <AdminAccordionSection id="hero" title="Hero" open={openIds.has("hero")} onToggle={onToggle}>
        <AdminField
          label="H1 title"
          value={page.heroTitle}
          onChange={(heroTitle) => onPatch((p) => ({ ...p, heroTitle }))}
        />
        <AdminField
          label="Subtitle"
          value={page.subtitleEn}
          multiline
          rows={4}
          onChange={(subtitleEn) => onPatch((p) => ({ ...p, subtitleEn }))}
        />
        <AdminLinesEditor
          label="Pills"
          lines={page.pills.map((item) => item.label)}
          onChange={(labels) =>
            onPatch((p) => ({ ...p, pills: labels.map((label) => ({ label })) }))
          }
        />
        <AdminField
          label="Hero image URL"
          value={page.heroImage}
          onChange={(heroImage) => onPatch((p) => ({ ...p, heroImage }))}
        />
        <AdminField
          label="Hero image alt"
          value={page.heroImageAlt}
          onChange={(heroImageAlt) => onPatch((p) => ({ ...p, heroImageAlt }))}
        />
      </AdminAccordionSection>

      <AdminAccordionSection
        id="countdown"
        title="Countdown"
        open={openIds.has("countdown")}
        onToggle={onToggle}
      >
        <AdminField
          label="Countdown label"
          value={page.countdown.label}
          onChange={(label) =>
            onPatch((p) => ({ ...p, countdown: { ...p.countdown, label } }))
          }
        />
        <AdminCountdownTarget
          targetIso={page.countdown.targetIso}
          onChange={(targetIso) =>
            onPatch((p) => ({ ...p, countdown: { ...p.countdown, targetIso } }))
          }
        />
        <AdminField
          label="Date line under countdown"
          value={page.countdown.dateText}
          multiline
          onChange={(dateText) =>
            onPatch((p) => ({ ...p, countdown: { ...p.countdown, dateText } }))
          }
        />
        <AdminField
          label="Message when countdown ends"
          value={page.countdown.liveMessage}
          multiline
          onChange={(liveMessage) =>
            onPatch((p) => ({ ...p, countdown: { ...p.countdown, liveMessage } }))
          }
        />
      </AdminAccordionSection>
    </>
  );
}
