"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import type {
  PubgMobileLiteRedeemCodeItem,
  PubgMobileLiteRedeemCodePageContent,
} from "@/src/lib/pubgMobileLiteRedeemCodes";
import {
  AdminPubgMobileLiteRedeemUiFields,
  patchRedeemPageUi,
} from "./AdminPubgMobileLiteRedeemUiFields";

const RichTextEditor = dynamic(
  () => import("@/src/components/admin/RichTextEditor").then((mod) => mod.RichTextEditor),
  { ssr: false },
);

type SectionId = "seo" | "copy" | "article" | "faq" | "ui" | "codes";

type Props = {
  page: PubgMobileLiteRedeemCodePageContent;
  openIds: Set<SectionId>;
  onToggle: (id: SectionId) => void;
  onPatch: (
    updater: (prev: PubgMobileLiteRedeemCodePageContent) => PubgMobileLiteRedeemCodePageContent,
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
  id: SectionId;
  title: string;
  open: boolean;
  onToggle: (id: SectionId) => void;
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

function emptyCode(): PubgMobileLiteRedeemCodeItem {
  return {
    id: `new-${Date.now()}`,
    title: "New redeem code",
    code: "CODE-HERE",
    status: "live",
    releasedLabel: "Released: ",
    expiresLabel: "Expires: ",
  };
}

export function AdminPubgMobileLiteRedeemForm({ page, openIds, onToggle, onPatch }: Props) {
  function patchCode(index: number, patch: Partial<PubgMobileLiteRedeemCodeItem>) {
    onPatch((prev) => {
      const codes = prev.codes.map((item, i) => (i === index ? { ...item, ...patch } : item));
      return { ...prev, codes };
    });
  }

  return (
    <>
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
        <Field label="H1 title" value={page.title} onChange={(title) => onPatch((p) => ({ ...p, title }))} />
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

      <Section id="article" title="Article (below codes)" open={openIds.has("article")} onToggle={onToggle}>
        <p style={{ margin: "0 0 10px", fontSize: 12, color: "#94a3b8", lineHeight: 1.45 }}>
          Insert image pe har image pe <strong>alt text</strong> prompt aayega. Empty = fallback{" "}
          <code>article-image</code>.
        </p>
        <div className="admin-pages-editor-wrap" style={{ marginBottom: 12 }}>
          <RichTextEditor
            value={page.articleHtml}
            onChange={(articleHtml) => onPatch((p) => ({ ...p, articleHtml }))}
            storageKey="bgmi_admin_pml_redeem_article_v1"
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

      <Section id="faq" title="FAQ" open={openIds.has("faq")} onToggle={onToggle}>
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
                  answer: "Answer here.",
                },
              ],
            }))
          }
        >
          Add FAQ
        </button>
      </Section>

      <Section id="ui" title="UI labels (badges, buttons, empty states)" open={openIds.has("ui")} onToggle={onToggle}>
        <AdminPubgMobileLiteRedeemUiFields
          ui={page.ui}
          onPatchUi={(patch) => onPatch((p) => patchRedeemPageUi(p, patch))}
        />
      </Section>

      <Section id="codes" title="Redeem codes" open={openIds.has("codes")} onToggle={onToggle}>
        {page.codes.map((item, index) => (
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
              <strong style={{ color: "#e2e8f0" }}>Code #{index + 1}</strong>
              <button
                type="button"
                className="admin-news-btn admin-news-btn-edit"
                onClick={() =>
                  onPatch((p) => ({ ...p, codes: p.codes.filter((_, i) => i !== index) }))
                }
                disabled={page.codes.length <= 1}
              >
                Remove
              </button>
            </div>
            <Field label="Title" value={item.title} onChange={(title) => patchCode(index, { title })} />
            <Field label="Code" value={item.code} onChange={(code) => patchCode(index, { code })} />
            <label style={{ display: "grid", gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>Status</span>
              <select
                value={item.status}
                onChange={(e) =>
                  patchCode(index, {
                    status: e.target.value === "expired" ? "expired" : "live",
                  })
                }
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#e2e8f0",
                }}
              >
                <option value="live">LIVE</option>
                <option value="expired">EXPIRED</option>
              </select>
            </label>
            {item.status === "live" ? (
              <>
                <Field
                  label="Released label"
                  value={item.releasedLabel ?? ""}
                  onChange={(releasedLabel) => patchCode(index, { releasedLabel })}
                />
                <Field
                  label="Expires label"
                  value={item.expiresLabel ?? ""}
                  onChange={(expiresLabel) => patchCode(index, { expiresLabel })}
                />
              </>
            ) : (
              <Field
                label="Expired on label"
                value={item.expiredOnLabel ?? ""}
                onChange={(expiredOnLabel) => patchCode(index, { expiredOnLabel })}
              />
            )}
          </div>
        ))}
        <button
          type="button"
          className="admin-news-btn admin-news-btn-edit"
          onClick={() => onPatch((p) => ({ ...p, codes: [...p.codes, emptyCode()] }))}
        >
          Add code
        </button>
      </Section>
    </>
  );
}

export type { SectionId as RedeemAdminSectionId };
