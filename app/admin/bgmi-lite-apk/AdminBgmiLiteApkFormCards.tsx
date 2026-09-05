"use client";

import type { BgmiLiteApkPageSectionId, BgmiLiteBetaApkPageContent } from "@/src/lib/bgmiLiteBetaApkPage";
import { AdminAccordionSection, AdminField, AdminLinesEditor } from "./adminBgmiLiteApkFields";

type Props = {
  page: BgmiLiteBetaApkPageContent;
  openIds: Set<BgmiLiteApkPageSectionId>;
  onToggle: (id: BgmiLiteApkPageSectionId) => void;
  onPatch: (updater: (prev: BgmiLiteBetaApkPageContent) => BgmiLiteBetaApkPageContent) => void;
};

export function AdminBgmiLiteApkFormCards({ page, openIds, onToggle, onPatch }: Props) {
  return (
    <AdminAccordionSection
      id="cards"
      title="Content cards"
      open={openIds.has("cards")}
      onToggle={onToggle}
    >
      {page.cards.map((card, index) => (
        <div
          key={card.id}
          style={{
            border: "1px solid #334155",
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
            background: "#07101c",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
            <strong style={{ color: "#e2e8f0" }}>Card #{index + 1}</strong>
            <button
              type="button"
              className="admin-news-btn admin-news-btn-edit"
              disabled={page.cards.length <= 1}
              onClick={() => onPatch((p) => ({ ...p, cards: p.cards.filter((_, i) => i !== index) }))}
            >
              Remove
            </button>
          </div>
          <AdminField
            label="Badge"
            value={card.badge}
            onChange={(badge) =>
              onPatch((p) => ({
                ...p,
                cards: p.cards.map((c, i) => (i === index ? { ...c, badge } : c)),
              }))
            }
          />
          <AdminField
            label="Icon class (e.g. fa-shield-halved)"
            value={card.icon}
            onChange={(icon) =>
              onPatch((p) => ({
                ...p,
                cards: p.cards.map((c, i) => (i === index ? { ...c, icon } : c)),
              }))
            }
          />
          <AdminField
            label="Title"
            value={card.title}
            onChange={(title) =>
              onPatch((p) => ({
                ...p,
                cards: p.cards.map((c, i) => (i === index ? { ...c, title } : c)),
              }))
            }
          />
          <AdminField
            label="Summary"
            value={card.summary}
            multiline
            onChange={(summary) =>
              onPatch((p) => ({
                ...p,
                cards: p.cards.map((c, i) => (i === index ? { ...c, summary } : c)),
              }))
            }
          />
          <AdminLinesEditor
            label="Bullet points"
            lines={card.points}
            onChange={(points) =>
              onPatch((p) => ({
                ...p,
                cards: p.cards.map((c, i) => (i === index ? { ...c, points } : c)),
              }))
            }
          />
          <AdminField
            label="CTA label (optional)"
            value={card.ctaLabel ?? ""}
            onChange={(ctaLabel) =>
              onPatch((p) => ({
                ...p,
                cards: p.cards.map((c, i) => (i === index ? { ...c, ctaLabel } : c)),
              }))
            }
          />
          <AdminField
            label="CTA link (optional)"
            value={card.ctaHref ?? ""}
            onChange={(ctaHref) =>
              onPatch((p) => ({
                ...p,
                cards: p.cards.map((c, i) => (i === index ? { ...c, ctaHref } : c)),
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
            cards: [
              ...p.cards,
              {
                id: `card-${Date.now()}`,
                badge: "New",
                icon: "fa-circle-info",
                title: "New card",
                summary: "Describe this block.",
                points: ["Point 1"],
              },
            ],
          }))
        }
      >
        Add card
      </button>
    </AdminAccordionSection>
  );
}
