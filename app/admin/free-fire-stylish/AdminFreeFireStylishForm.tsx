"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type { FreeFireStylishNamePageContent } from "@/src/lib/freeFireStylishNamePage";
import { AdminFreeFireStylishIdeasSection } from "./AdminFreeFireStylishIdeasSection";

const RichTextEditor = dynamic(
  () => import("@/src/components/admin/RichTextEditor").then((mod) => mod.RichTextEditor),
  { ssr: false },
);

export type NameAdminSectionId = "seo" | "copy" | "ideas" | "article" | "faq";

type Props = {
  page: FreeFireStylishNamePageContent;
  openIds: Set<NameAdminSectionId>;
  onToggle: (id: NameAdminSectionId) => void;
  onPatch: (
    updater: (prev: FreeFireStylishNamePageContent) => FreeFireStylishNamePageContent,
  ) => void;
  pathLockedLabel?: string;
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
    <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
      <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
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

function Section({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: NameAdminSectionId;
  title: string;
  open: boolean;
  onToggle: (id: NameAdminSectionId) => void;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        marginBottom: 14,
        border: "1px solid #334155",
        borderRadius: 10,
        overflow: "hidden",
        background: "#020617",
      }}
    >
      <button
        type="button"
        onClick={() => onToggle(id)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          padding: "12px 14px",
          border: 0,
          background: "#0f172a",
          color: "#e2e8f0",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        <span>{title}</span>
        <span aria-hidden>{open ? "▾" : "▸"}</span>
      </button>
      {open ? <div style={{ padding: 14 }}>{children}</div> : null}
    </div>
  );
}

export function AdminFreeFireStylishForm({
  page,
  openIds,
  onToggle,
  onPatch,
  pathLockedLabel = "/free-fire-stylish-name",
}: Props) {
  return (
    <>
      <Section id="seo" title="SEO" open={openIds.has("seo")} onToggle={onToggle}>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: "#94a3b8" }}>
          URL path stays locked to <code>{pathLockedLabel}</code>.
        </p>
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
          value={page.seoKeywords.join(", ")}
          onChange={(raw) =>
            onPatch((p) => ({
              ...p,
              seoKeywords: raw
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean),
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
          label="Subtitle"
          value={page.subtitle}
          multiline
          rows={3}
          onChange={(subtitle) => onPatch((p) => ({ ...p, subtitle }))}
        />
        <Field
          label="Studio tip text"
          value={page.tipText}
          multiline
          rows={3}
          onChange={(tipText) => onPatch((p) => ({ ...p, tipText }))}
        />
        <Field
          label="Studio empty text"
          value={page.emptyStudioText}
          multiline
          rows={2}
          onChange={(emptyStudioText) => onPatch((p) => ({ ...p, emptyStudioText }))}
        />
        <Field
          label="Steps section heading"
          value={page.stepsHeading}
          onChange={(stepsHeading) => onPatch((p) => ({ ...p, stepsHeading }))}
        />
        {page.steps.map((step, index) => (
          <div
            key={`step-${index}`}
            style={{
              border: "1px solid #334155",
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
              background: "#0b1220",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
              <strong style={{ color: "#e2e8f0" }}>Step #{index + 1}</strong>
              <button
                type="button"
                className="admin-news-btn admin-news-btn-edit"
                onClick={() =>
                  onPatch((p) => ({ ...p, steps: p.steps.filter((_, i) => i !== index) }))
                }
                disabled={page.steps.length <= 1}
              >
                Remove
              </button>
            </div>
            <Field
              label="Step title"
              value={step.title}
              onChange={(title) =>
                onPatch((p) => ({
                  ...p,
                  steps: p.steps.map((s, i) => (i === index ? { ...s, title } : s)),
                }))
              }
            />
            <Field
              label="Step text"
              value={step.text}
              multiline
              onChange={(text) =>
                onPatch((p) => ({
                  ...p,
                  steps: p.steps.map((s, i) => (i === index ? { ...s, text } : s)),
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
              steps: [...p.steps, { title: "New step", text: "Describe this step." }],
            }))
          }
        >
          Add step
        </button>
      </Section>

      <Section id="ideas" title="Quick name ideas" open={openIds.has("ideas")} onToggle={onToggle}>
        <AdminFreeFireStylishIdeasSection page={page} onPatch={onPatch} />
      </Section>

      <Section id="article" title="Article" open={openIds.has("article")} onToggle={onToggle}>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: "#94a3b8", lineHeight: 1.45 }}>
          Insert image pe <strong>alt text</strong> prompt aayega. Empty alt = fallback{" "}
          <code>article-image</code>.
        </p>
        <div className="admin-pages-editor-wrap" style={{ marginBottom: 12 }}>
          <RichTextEditor
            value={page.articleHtml}
            onChange={(articleHtml) => onPatch((p) => ({ ...p, articleHtml }))}
            storageKey="bgmi_admin_ff_stylish_article_v1"
          />
        </div>
        <Field
          label="Comments lead"
          value={page.commentsLead}
          multiline
          rows={3}
          onChange={(commentsLead) => onPatch((p) => ({ ...p, commentsLead }))}
        />
      </Section>

      <Section id="faq" title="FAQ" open={openIds.has("faq")} onToggle={onToggle}>
        <Field
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
              background: "#0b1220",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
              <strong style={{ color: "#e2e8f0" }}>FAQ #{index + 1}</strong>
              <button
                type="button"
                className="admin-news-btn admin-news-btn-edit"
                onClick={() =>
                  onPatch((p) => ({ ...p, faqs: p.faqs.filter((_, i) => i !== index) }))
                }
                disabled={page.faqs.length <= 1}
              >
                Remove
              </button>
            </div>
            <Field
              label="Question"
              value={item.question}
              onChange={(question) =>
                onPatch((p) => ({
                  ...p,
                  faqs: p.faqs.map((f, i) => (i === index ? { ...f, question } : f)),
                }))
              }
            />
            <Field
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
      </Section>
    </>
  );
}
