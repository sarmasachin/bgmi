"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";
import {
  GAME_ARTICLE_GAMES,
  type GameArticleGame,
} from "@/src/lib/gameArticleGames";

function EditorBootSkeleton({ html }: { html?: string }) {
  return (
    <div className="rich-editor" aria-busy="true">
      <div className="rich-editor-toolbar" style={{ minHeight: 48, opacity: 0.35, pointerEvents: "none" }} />
      <div className="rich-editor-editable-wrap">
        <div
          className="rich-editor-content"
          style={{ height: 360, overflow: "auto" }}
          dangerouslySetInnerHTML={{ __html: html || "<p></p>" }}
        />
      </div>
    </div>
  );
}

type Game = GameArticleGame;

type InitialData = {
  bgmiHtml: string;
  bgmiLiteHtml: string;
  pubgHtml: string;
  pubgMobileLiteHtml: string;
  freefireHtml: string;
  freefireMaxHtml: string;
  pubgMobileCodesHtml: string;
  bgmiUsingDefault: boolean;
  bgmiLiteUsingDefault: boolean;
  pubgUsingDefault: boolean;
  pubgMobileLiteUsingDefault: boolean;
  freefireUsingDefault: boolean;
  freefireMaxUsingDefault: boolean;
  pubgMobileCodesUsingDefault: boolean;
};

type Props = {
  initialData?: InitialData;
};

function labelFor(game: Game) {
  return GAME_ARTICLE_GAMES.find((g) => g.id === game)?.label ?? game;
}

function previewFor(game: Game) {
  return GAME_ARTICLE_GAMES.find((g) => g.id === game)?.previewPath ?? "/";
}

function draftKey(game: Game) {
  return `bgmi_admin_game_article_${game}_v1`;
}

function clearEditorDraft(game: Game) {
  try {
    window.localStorage.removeItem(draftKey(game));
  } catch {
    // ignore quota / private mode
  }
}

export default function AdminGameArticlesClient({ initialData }: Props) {
  const [game, setGame] = useState<Game>("freefire");
  const [htmlByGame, setHtmlByGame] = useState<Record<Game, string>>({
    bgmi: initialData?.bgmiHtml ?? "",
    "bgmi-lite": initialData?.bgmiLiteHtml ?? "",
    pubg: initialData?.pubgHtml ?? "",
    "pubg-mobile-lite": initialData?.pubgMobileLiteHtml ?? "",
    freefire: initialData?.freefireHtml ?? "",
    "freefire-max": initialData?.freefireMaxHtml ?? "",
    "pubg-mobile-codes": initialData?.pubgMobileCodesHtml ?? "",
  });
  const [defaultByGame, setDefaultByGame] = useState<Record<Game, boolean>>({
    bgmi: initialData?.bgmiUsingDefault ?? true,
    "bgmi-lite": initialData?.bgmiLiteUsingDefault ?? true,
    pubg: initialData?.pubgUsingDefault ?? true,
    "pubg-mobile-lite": initialData?.pubgMobileLiteUsingDefault ?? true,
    freefire: initialData?.freefireUsingDefault ?? true,
    "freefire-max": initialData?.freefireMaxUsingDefault ?? true,
    "pubg-mobile-codes": initialData?.pubgMobileCodesUsingDefault ?? true,
  });
  const [editorNonce, setEditorNonce] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [Editor, setEditor] = useState<null | typeof import("@/src/components/admin/RichTextEditor").RichTextEditor>(
    null,
  );
  const setMessage = useAdminFlash();

  const html = htmlByGame[game];
  const usingDefault = defaultByGame[game];

  useEffect(() => {
    let cancelled = false;
    void import("@/src/components/admin/RichTextEditor").then((mod) => {
      if (!cancelled) setEditor(() => mod.RichTextEditor);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function applyData(data: InitialData) {
    setHtmlByGame({
      bgmi: data.bgmiHtml,
      "bgmi-lite": data.bgmiLiteHtml,
      pubg: data.pubgHtml,
      "pubg-mobile-lite": data.pubgMobileLiteHtml,
      freefire: data.freefireHtml,
      "freefire-max": data.freefireMaxHtml,
      "pubg-mobile-codes": data.pubgMobileCodesHtml,
    });
    setDefaultByGame({
      bgmi: data.bgmiUsingDefault,
      "bgmi-lite": data.bgmiLiteUsingDefault,
      pubg: data.pubgUsingDefault,
      "pubg-mobile-lite": data.pubgMobileLiteUsingDefault,
      freefire: data.freefireUsingDefault,
      "freefire-max": data.freefireMaxUsingDefault,
      "pubg-mobile-codes": data.pubgMobileCodesUsingDefault,
    });
    setEditorNonce((n) => n + 1);
  }

  async function load(opts?: { soft?: boolean }) {
    if (!opts?.soft) setLoading(true);
    try {
      const res = await fetch("/api/admin/game-articles", {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Failed to load game articles."));
        return;
      }
      const json = (await res.json()) as { data?: InitialData };
      if (json.data) applyData(json.data);
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  // Always refetch from API (SSR initialData is only a first paint). Soft-nav / stale RSC
  // must not leave the editor on pre-save HTML while the public site shows DB content.
  useEffect(() => {
    void load({ soft: initialData !== undefined });
  }, []);

  function setHtml(value: string) {
    setHtmlByGame((prev) => ({ ...prev, [game]: value }));
  }

  function switchGame(next: Game) {
    if (next === game) return;
    setGame(next);
    setEditorNonce((n) => n + 1);
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/game-articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ game, html }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save article."));
        return;
      }
      const json = (await res.json()) as { usingDefault?: boolean; html?: string };
      clearEditorDraft(game);
      setHtmlByGame((prev) => ({ ...prev, [game]: json.html ?? "" }));
      setDefaultByGame((prev) => ({ ...prev, [game]: Boolean(json.usingDefault) }));
      setMessage(
        json.usingDefault
          ? `${labelFor(game)} article cleared — site will show the built-in default.`
          : `${labelFor(game)} article saved.`,
      );
      await load({ soft: true });
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  async function clearToDefault() {
    if (!window.confirm("Clear custom article and use the built-in default on the site?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/game-articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ game, html: "" }),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not clear article."));
        return;
      }
      clearEditorDraft(game);
      setMessage("Reverted to built-in default article.");
      await load({ soft: true });
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-section">
      <div className="admin-comments-head">
        <h1>Game Articles</h1>
        <button type="button" className="admin-news-btn admin-news-btn-edit" onClick={() => void load()}>
          Refresh
        </button>
      </div>

      <p style={{ color: "#94a3b8", marginTop: 0, maxWidth: 720 }}>
        Edit the long guide article under the calculator for each game. FAQ cards are managed in{" "}
        <Link href="/admin/game-faqs" style={{ color: "var(--primary)" }}>
          Game FAQs
        </Link>
        .
      </p>

      <div className="admin-news-actions-wrap" style={{ gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {GAME_ARTICLE_GAMES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`admin-news-btn ${game === item.id ? "admin-news-btn-primary" : "admin-news-btn-edit"}`}
            onClick={() => switchGame(item.id)}
            style={{ whiteSpace: "nowrap" }}
          >
            {item.label} article
          </button>
        ))}
      </div>

      {loading ? (
        <EditorBootSkeleton html={html} />
      ) : (
        <form onSubmit={onSave}>
          <p style={{ fontSize: 13, color: usingDefault ? "#fbbf24" : "#5eead4", marginBottom: 10 }}>
            {usingDefault
              ? "Using built-in default article on the live site. Save custom HTML below to override."
              : "Custom article is live on the site."}
          </p>

          {Editor ? (
            <Editor
              key={`game-article-${game}-${editorNonce}`}
              value={html}
              onChange={setHtml}
              storageKey={draftKey(game)}
            />
          ) : (
            <EditorBootSkeleton html={html} />
          )}

          <div className="admin-news-actions-wrap" style={{ marginTop: 14, gap: 8 }}>
            <button type="submit" className="admin-news-btn admin-news-btn-primary" disabled={saving}>
              {saving ? "Saving…" : `Save ${labelFor(game)} article`}
            </button>
            <button
              type="button"
              className="admin-news-btn admin-news-btn-edit"
              disabled={saving || usingDefault}
              onClick={() => void clearToDefault()}
            >
              Use built-in default
            </button>
            <a
              className="admin-news-btn admin-news-btn-edit"
              href={previewFor(game)}
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
