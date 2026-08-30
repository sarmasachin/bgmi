"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import {
  BGMI_CARD_SECTIONS,
  BGMI_LITE_CARD_SECTIONS,
  HOME_CARD_SECTIONS,
  MAX_CARD_SECTIONS,
  PAGE_CARDS_VARIANTS,
  PUBG_MOBILE_LITE_CARD_SECTIONS,
} from "@/src/lib/homeCardsTypes";
import type {
  FfHomeCards,
  HomeCardSectionId,
  PageCardsVariant,
} from "@/src/lib/homeCardsTypes";
import { readApiError } from "@/src/lib/userFacingError";
import { AdminPageCardsForm } from "./AdminPageCardsForm";

type VariantState = {
  cards: FfHomeCards;
  usingDefault: boolean;
};

type Props = {
  initialByVariant: Record<PageCardsVariant, VariantState>;
};

function sectionsForVariant(variant: PageCardsVariant) {
  if (variant === "freefire-max") return MAX_CARD_SECTIONS;
  if (variant === "bgmi-lite") return BGMI_LITE_CARD_SECTIONS;
  if (variant === "pubg-mobile-lite") return PUBG_MOBILE_LITE_CARD_SECTIONS;
  if (variant === "bgmi" || variant === "pubg" || variant === "pubg-mobile-codes") {
    return BGMI_CARD_SECTIONS;
  }
  return HOME_CARD_SECTIONS;
}

export default function AdminHomeCardsClient({ initialByVariant }: Props) {
  const [variant, setVariant] = useState<PageCardsVariant>("freefire");
  const [byVariant, setByVariant] = useState(initialByVariant);
  const [openIds, setOpenIds] = useState<Set<HomeCardSectionId>>(() => new Set(["hero"]));
  const [saving, setSaving] = useState(false);
  const setMessage = useAdminFlash();

  const active = byVariant[variant];
  const meta = PAGE_CARDS_VARIANTS.find((item) => item.id === variant)!;
  const sectionRows = sectionsForVariant(variant);
  const sections = sectionRows.map((s) => s.id) as HomeCardSectionId[];

  const sectionLabels = useMemo(() => {
    const rows = sectionsForVariant(variant);
    return new Map(rows.map((s) => [s.id as HomeCardSectionId, s.label]));
  }, [variant]);

  function toggle(id: HomeCardSectionId) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function patchCards(updater: (prev: FfHomeCards) => FfHomeCards) {
    setByVariant((prev) => ({
      ...prev,
      [variant]: { ...prev[variant], cards: updater(prev[variant].cards) },
    }));
  }

  function switchVariant(next: PageCardsVariant) {
    if (next === variant) return;
    setVariant(next);
    setOpenIds(new Set(["hero"]));
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/home-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "save", game: variant, cards: active.cards }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save page cards."));
        return;
      }
      const json = (await res.json()) as { cards?: FfHomeCards; usingDefault?: boolean };
      if (json.cards) {
        setByVariant((prev) => ({
          ...prev,
          [variant]: {
            cards: json.cards!,
            usingDefault: Boolean(json.usingDefault),
          },
        }));
      }
      setMessage(`${meta.label} page cards saved.`);
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  async function onReset() {
    if (!window.confirm(`Reset ${meta.label} page cards to built-in defaults?`)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/home-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reset", game: variant }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not reset page cards."));
        return;
      }
      const json = (await res.json()) as { cards?: FfHomeCards; usingDefault?: boolean };
      if (json.cards) {
        setByVariant((prev) => ({
          ...prev,
          [variant]: {
            cards: json.cards!,
            usingDefault: Boolean(json.usingDefault),
          },
        }));
      }
      setMessage(`Reverted ${meta.label} to built-in defaults.`);
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-comments-head">
        <h1>Page Cards</h1>
        <a
          className="admin-news-btn admin-news-btn-edit"
          href={meta.previewPath}
          target="_blank"
          rel="noreferrer"
        >
          Preview {meta.label}
        </a>
      </div>

      <div
        role="tablist"
        aria-label="Page cards game"
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginBottom: 16,
          padding: 6,
          borderRadius: 12,
          border: "1px solid #1e293b",
          background: "#0b1220",
          width: "fit-content",
          maxWidth: "100%",
        }}
      >
        {PAGE_CARDS_VARIANTS.map((item) => {
          const selected = item.id === variant;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => switchVariant(item.id)}
              style={{
                border: "none",
                cursor: "pointer",
                borderRadius: 8,
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: "nowrap",
                color: selected ? "#0f172a" : "#cbd5e1",
                background: selected
                  ? "linear-gradient(135deg, #5eead4, #67e8f9)"
                  : "transparent",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <form onSubmit={onSave}>
        <AdminPageCardsForm
          cards={active.cards}
          sectionIds={sections}
          sectionLabels={sectionLabels}
          openIds={openIds}
          onToggle={toggle}
          onPatch={patchCards}
        />

        <div
          style={{
            position: "sticky",
            bottom: 0,
            marginTop: 20,
            padding: "14px 0",
            background: "linear-gradient(180deg, transparent, #0b0e14 30%)",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            zIndex: 2,
          }}
        >
          <button type="submit" className="admin-news-btn admin-news-btn-primary" disabled={saving}>
            {saving ? "Saving…" : `Save ${meta.label}`}
          </button>
          <button
            type="button"
            className="admin-news-btn admin-news-btn-edit"
            disabled={saving || active.usingDefault}
            onClick={() => void onReset()}
          >
            Reset to defaults
          </button>
        </div>
      </form>
    </section>
  );
}
