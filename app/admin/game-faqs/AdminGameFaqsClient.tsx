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

function newId() {
  return `faq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function previewHref(game: GameFaqGame) {
  if (game === "pubg") return "/pubg";
  if (game === "freefire") return "/free-fire-sensitivity-settings-calculator";
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
  const setMessage = useAdminFlash();

  const current = bundles.find((b) => b.game === game) ?? bundles[0]!;

  async function load() {
    setLoading(true);
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
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialData !== undefined) return;
    void load();
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
      setMessage(`Saved ${json.savedCount ?? 0} FAQ item(s) for ${current.label}.`);
      await load();
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-comments-head">
        <h1>Game FAQs</h1>
        <button type="button" className="admin-news-btn admin-news-btn-edit" onClick={() => void load()}>
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
                    onClick={() => removeItem(item.id)}
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
  );
}
