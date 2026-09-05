"use client";

import dynamic from "next/dynamic";
import type { BgmiLiteApkPageSectionId, BgmiLiteBetaApkPageContent } from "@/src/lib/bgmiLiteBetaApkPage";
import { AdminAccordionSection, AdminField } from "./adminBgmiLiteApkFields";

const RichTextEditor = dynamic(
  () => import("@/src/components/admin/RichTextEditor").then((mod) => mod.RichTextEditor),
  { ssr: false },
);

type Props = {
  page: BgmiLiteBetaApkPageContent;
  openIds: Set<BgmiLiteApkPageSectionId>;
  onToggle: (id: BgmiLiteApkPageSectionId) => void;
  onPatch: (updater: (prev: BgmiLiteBetaApkPageContent) => BgmiLiteBetaApkPageContent) => void;
};

export function AdminBgmiLiteApkFormArticle({ page, openIds, onToggle, onPatch }: Props) {
  return (
    <>
      <AdminAccordionSection
        id="article"
        title="Article"
        open={openIds.has("article")}
        onToggle={onToggle}
      >
        <p style={{ margin: "0 0 10px", fontSize: 12, color: "#94a3b8", lineHeight: 1.45 }}>
          Light article under the cards. Paste strips Word fonts. Insert image asks for alt text.
        </p>
        <div className="admin-pages-editor-wrap" style={{ marginBottom: 12 }}>
          <RichTextEditor
            value={page.articleHtml}
            onChange={(articleHtml) => onPatch((p) => ({ ...p, articleHtml }))}
            storageKey="bgmi_admin_lite_apk_article_v1"
          />
        </div>
        <AdminField
          label="Comments lead"
          value={page.commentsLead}
          multiline
          onChange={(commentsLead) => onPatch((p) => ({ ...p, commentsLead }))}
        />
      </AdminAccordionSection>

      <AdminAccordionSection id="faqs" title="FAQs" open={openIds.has("faqs")} onToggle={onToggle}>
        <AdminField
          label="FAQ section title"
          value={page.faqTitle}
          onChange={(faqTitle) => onPatch((p) => ({ ...p, faqTitle }))}
        />
        {page.faqs.map((item, index) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #334155",
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
              background: "#07101c",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
              <strong style={{ color: "#e2e8f0" }}>FAQ #{index + 1}</strong>
              <button
                type="button"
                className="admin-news-btn admin-news-btn-edit"
                disabled={page.faqs.length <= 1}
                onClick={() => onPatch((p) => ({ ...p, faqs: p.faqs.filter((_, i) => i !== index) }))}
              >
                Remove
              </button>
            </div>
            <AdminField
              label="Question"
              value={item.question}
              onChange={(question) =>
                onPatch((p) => ({
                  ...p,
                  faqs: p.faqs.map((f, i) => (i === index ? { ...f, question } : f)),
                }))
              }
            />
            <AdminField
              label="Answer"
              value={item.answer}
              multiline
              rows={4}
              onChange={(answer) =>
                onPatch((p) => ({
                  ...p,
                  faqs: p.faqs.map((f, i) => (i === index ? { ...f, answer } : f)),
                }))
              }
            />
          </div>
        ))}
        <button
          type="button"
          className="admin-news-btn admin-news-btn-edit"
          onClick={() =>
            onPatch((p) => ({
              ...p,
              faqs: [
                ...p.faqs,
                {
                  id: `faq-${Date.now()}`,
                  question: "New question?",
                  answer: "Write the answer here.",
                },
              ],
            }))
          }
        >
          Add FAQ
        </button>
      </AdminAccordionSection>
    </>
  );
}
