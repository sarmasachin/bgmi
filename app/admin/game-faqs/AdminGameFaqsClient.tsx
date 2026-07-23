"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";
import {
  GAME_FAQ_GAMES,
  type GameFaqGame,
  type HomeFaqItem,
} from "@/src/server/repositories/homeFaqRepository";

type GameFaqBundle = {
  game: GameFaqGame;
  label: string;
  items: HomeFaqItem[];
  usingDefault: boolean;
};

type Props = {
  initialData?: GameFaqBundle[];
};

type ConfirmDelete = {
  id: string;
  question: string;
  index: number;
};

function newId() {
  return `faq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function previewHref(game: GameFaqGame) {
  if (game === "pubg") return "/pubg";
  if (game === "freefire") return "/";
  if (game === "freefire-max") return "/free-fire-max-sensitivity-settings-calculator";
  return "/";
}

export default function AdminGameFaqsClient({ initialData }: Props) {
  const [game, setGame] = useState<GameFaqGame>("bgmi");
  const [bundles, setBundles] = useState<GameFaqBundle[]>(
    initialData ??
      GAME_FAQ_GAMES.map((g) => ({
        game: g.id,
        label: g.label,
        items: [],
        usingDefault: true,
      })),
  );
  const [loading, setLoading] = useState(initialData === undefined);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDelete | null>(null);
  const setMessage = useAdminFlash();

  const current = bundles.find((b) => b.game === game) ?? bundles[0]!;

  async function load(opts?: { soft?: boolean }) {
    // Soft refresh keeps the form mounted — avoids Loading… blink on Refresh/Save.
    const soft =
      opts?.soft === true
        ? true
        : opts?.soft === false
          ? false
          : bundles.some((b) => b.items.length > 0);
    if (!soft) setLoading(true);
    try {
      const res = await fetch("/api/admin/game-faqs", {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        setMessage("Failed to load FAQs.");
        return;
      }
      const json = (await res.json()) as { data?: GameFaqBundle[] };
      if (json.data?.length) setBundles(json.data);
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      if (!soft) setLoading(false);
    }
  }

  useEffect(() => {
    if (initialData !== undefined) return;
    void load({ soft: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  function updateItems(updater: (items: HomeFaqItem[]) => HomeFaqItem[]) {
    setBundles((prev) =>
      prev.map((b) => (b.game === game ? { ...b, items: updater(b.items) } : b)),
    );
  }

  function addItem() {
    updateItems((items) => [...items, { id: newId(), question: "", answer: "" }]);
  }

  function removeItem(id: string) {
    updateItems((items) => items.filter((item) => item.id !== id));
  }

  function closeConfirmModal() {
    setConfirmDelete(null);
  }

  function confirmPendingDelete() {
    if (!confirmDelete) return;
    removeItem(confirmDelete.id);
    setConfirmDelete(null);
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/game-faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ game, items: current.items }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save FAQ."));
        return;
      }
      const json = (await res.json()) as { savedCount?: number };
      setBundles((prev) =>
        prev.map((b) => (b.game === game ? { ...b, usingDefault: false } : b)),
      );
      setMessage(`Saved ${json.savedCount ?? 0} FAQ item(s) for ${current.label}.`);
      await load({ soft: true });
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
    <section className="admin-section">
      <div className="admin-comments-head">
        <h1>Game FAQs</h1>
        <button
          type="button"
          className="admin-news-btn admin-news-btn-edit"
          onClick={() => void load({ soft: true })}
        >
          Refresh
        </button>
      </div>

      <p style={{ color: "#94a3b8", marginTop: 0, maxWidth: 720 }}>
        Har game ke FAQ alag hain. BGMI, PUBG Mobile, Free Fire, aur Free Fire Max ke liye alag-alag
        questions add / edit / delete karo. Empty list save = us game pe FAQ section hide.
      </p>

      <div className="admin-news-actions-wrap" style={{ gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {GAME_FAQ_GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`admin-news-btn ${game === g.id ? "admin-news-btn-primary" : "admin-news-btn-edit"}`}
            onClick={() => setGame(g.id)}
          >
            {g.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <form onSubmit={onSave}>
          <p style={{ fontSize: 13, color: current.usingDefault ? "#fbbf24" : "#5eead4" }}>
            {current.usingDefault
              ? `${current.label}: showing built-in default FAQs until you save.`
              : `${current.label}: custom FAQs are live.`}
          </p>

          <div className="admin-faq-editor">
            {current.items.map((item, index) => (
              <div
                key={item.id}
                style={{
                  border: "1px solid rgba(148,163,184,0.25)",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <strong>
                    {current.label} FAQ #{index + 1}
                  </strong>
                  <button
                    type="button"
                    className="admin-news-btn admin-news-btn-danger"
                    onClick={() =>
                      setConfirmDelete({
                        id: item.id,
                        question: item.question.trim() || `FAQ #${index + 1}`,
                        index: index + 1,
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
                <label>
                  Question
                  <input
                    className="admin-input"
                    value={item.question}
                    maxLength={500}
                    onChange={(e) =>
                      updateItems((items) =>
                        items.map((row) =>
                          row.id === item.id ? { ...row, question: e.target.value } : row,
                        ),
                      )
                    }
                  />
                </label>
                <label style={{ display: "block", marginTop: 8 }}>
                  Answer
                  <textarea
                    className="admin-input"
                    value={item.answer}
                    rows={4}
                    maxLength={4000}
                    onChange={(e) =>
                      updateItems((items) =>
                        items.map((row) =>
                          row.id === item.id ? { ...row, answer: e.target.value } : row,
                        ),
                      )
                    }
                  />
                </label>
              </div>
            ))}
          </div>

          <div className="admin-news-actions-wrap" style={{ gap: 8, marginTop: 12 }}>
            <button type="button" className="admin-news-btn admin-news-btn-edit" onClick={addItem}>
              Add FAQ
            </button>
            <button type="submit" className="admin-news-btn admin-news-btn-primary" disabled={saving}>
              {saving ? "Saving…" : `Save ${current.label} FAQs`}
            </button>
            <a
              className="admin-news-btn admin-news-btn-edit"
              href={previewHref(game)}
              target="_blank"
              rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              Preview page
            </a>
          </div>
        </form>
      )}
    </section>

    {confirmDelete ? (
      <div className="admin-modal-overlay" role="presentation" onClick={closeConfirmModal}>
        <div
          className="admin-modal admin-confirm-modal is-danger"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-faq-confirm-title"
          aria-describedby="admin-faq-confirm-desc"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="admin-confirm-icon" aria-hidden>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
              <path
                d="M9 3h6m-8 4h10m-9 0 .7 12.2A1.5 1.5 0 0 0 10.2 21h3.6a1.5 1.5 0 0 0 1.5-1.4L16 7M10 11v6m4-6v6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 id="admin-faq-confirm-title">Delete this FAQ?</h2>
          <p id="admin-faq-confirm-desc" className="admin-modal-subtitle">
            This will remove the FAQ from the list. Save to apply the change on the live page.
          </p>
          <div className="admin-confirm-meta">
            <span className="admin-confirm-meta-label">{current.label} FAQ #{confirmDelete.index}</span>
            <strong>{confirmDelete.question}</strong>
          </div>
          <div className="admin-modal-actions">
            <button type="button" className="admin-modal-btn-secondary" onClick={closeConfirmModal}>
              Cancel
            </button>
            <button
              type="button"
              className="admin-modal-btn-primary admin-modal-btn-danger"
              onClick={confirmPendingDelete}
            >
              Yes, delete
            </button>
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
