"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type { FreeFireRedeemCodePageContent } from "@/src/lib/freeFireRedeemCodes";
import {
  formatCommaKeywordsInput,
  parseCommaKeywordsInput,
} from "@/src/lib/commaSeparatedKeywordsInput";
import { AdminFreeFireRedeemCodesSection } from "./AdminFreeFireRedeemCodesSection";
import { AdminFreeFireRedeemFaqsSection } from "./AdminFreeFireRedeemFaqsSection";
import {
  AdminFreeFireRedeemUiFields,
  patchRedeemPageUi,
} from "./AdminFreeFireRedeemUiFields";

const RichTextEditor = dynamic(
  () => import("@/src/components/admin/RichTextEditor").then((mod) => mod.RichTextEditor),
  { ssr: false },
);

type SectionId = "codes" | "faq" | "seo" | "copy" | "article" | "ui";

type Props = {
  page: FreeFireRedeemCodePageContent;
  openIds: Set<SectionId>;
  onToggle: (id: SectionId) => void;
  onPatch: (
    updater: (prev: FreeFireRedeemCodePageContent) => FreeFireRedeemCodePageContent,
  ) => void;
};

function Field({
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
    <label className="admin-redeem-field">
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="admin-redeem-input"
          style={{ resize: "vertical" }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="admin-redeem-input"
        />
      )}
    </label>
  );
}

function Section({
  id,
  title,
  badge,
  open,
  onToggle,
  children,
}: {
  id: SectionId;
  title: string;
  badge?: string;
  open: boolean;
  onToggle: (id: SectionId) => void;
  children: ReactNode;
}) {
  return (
    <div className="admin-redeem-section">
      <button type="button" className="admin-redeem-section-head" onClick={() => onToggle(id)}>
        <span className="admin-redeem-section-title">
          {title}
          {badge ? <em className="admin-redeem-section-badge">{badge}</em> : null}
        </span>
        <span aria-hidden>{open ? "▾" : "▸"}</span>
      </button>
      {open ? <div className="admin-redeem-section-body">{children}</div> : null}
    </div>
  );
}

export function AdminFreeFireRedeemForm({ page, openIds, onToggle, onPatch }: Props) {
  const liveCount = page.codes.filter((c) => c.status === "live").length;

  return (
    <>
      <Section
        id="codes"
        title="Redeem codes"
        badge={`${liveCount} live · ${page.codes.length} total`}
        open={openIds.has("codes")}
        onToggle={onToggle}
      >
        <AdminFreeFireRedeemCodesSection
          codes={page.codes}
          onChangeCodes={(codes) => onPatch((p) => ({ ...p, codes }))}
        />
      </Section>

      <Section
        id="faq"
        title="FAQ"
        badge={`${page.faqs.length}`}
        open={openIds.has("faq")}
        onToggle={onToggle}
      >
        <AdminFreeFireRedeemFaqsSection
          faqs={page.faqs}
          onChangeFaqs={(faqs) => onPatch((p) => ({ ...p, faqs }))}
        />
      </Section>

      <Section id="seo" title="SEO" open={openIds.has("seo")} onToggle={onToggle}>
        <Field
          label="SEO title"
          value={page.seoTitle}
          onChange={(seoTitle) => onPatch((p) => ({ ...p, seoTitle }))}
        />
        <Field
          label="SEO description"
          value={page.seoDescription}
          multiline
          onChange={(seoDescription) => onPatch((p) => ({ ...p, seoDescription }))}
        />
        <Field
          label="SEO keywords (comma separated)"
          value={formatCommaKeywordsInput(page.seoKeywords)}
          onChange={(raw) =>
            onPatch((p) => ({
              ...p,
              seoKeywords: parseCommaKeywordsInput(raw),
            }))
          }
        />
      </Section>

      <Section id="copy" title="Page copy" open={openIds.has("copy")} onToggle={onToggle}>
        <Field
          label="H1 title"
          value={page.title}
          onChange={(title) => onPatch((p) => ({ ...p, title }))}
        />
        <Field
          label="Intro paragraph"
          value={page.intro}
          multiline
          rows={4}
          onChange={(intro) => onPatch((p) => ({ ...p, intro }))}
        />
        <Field
          label="Active section H2"
          value={page.sectionHeading}
          onChange={(sectionHeading) => onPatch((p) => ({ ...p, sectionHeading }))}
        />
        <Field
          label="Expired archive heading"
          value={page.archiveHeading}
          onChange={(archiveHeading) => onPatch((p) => ({ ...p, archiveHeading }))}
        />
        <Field
          label="Closing paragraph"
          value={page.closing}
          multiline
          rows={4}
          onChange={(closing) => onPatch((p) => ({ ...p, closing }))}
        />
      </Section>

      <Section
        id="article"
        title="Article (below codes)"
        open={openIds.has("article")}
        onToggle={onToggle}
      >
        <p className="admin-redeem-hint">
          Insert image pe har image pe <strong>alt text</strong> prompt aayega. Empty = fallback{" "}
          <code>article-image</code>.
        </p>
        <div className="admin-pages-editor-wrap" style={{ marginBottom: 12 }}>
          <RichTextEditor
            value={page.articleHtml}
            onChange={(articleHtml) => onPatch((p) => ({ ...p, articleHtml }))}
            storageKey="bgmi_admin_ff_redeem_article_v1"
          />
        </div>
        <Field
          label="Comments lead (under Comments heading)"
          value={page.commentsLead}
          multiline
          rows={3}
          onChange={(commentsLead) => onPatch((p) => ({ ...p, commentsLead }))}
        />
      </Section>

      <Section
        id="ui"
        title="UI labels (badges, buttons, empty states)"
        open={openIds.has("ui")}
        onToggle={onToggle}
      >
        <AdminFreeFireRedeemUiFields
          ui={page.ui}
          onPatchUi={(patch) => onPatch((p) => patchRedeemPageUi(p, patch))}
        />
      </Section>
    </>
  );
}

export type { SectionId as RedeemAdminSectionId };
