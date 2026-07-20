"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import { readApiError } from "@/src/lib/userFacingError";

const RichTextEditor = dynamic(
  () => import("@/src/components/admin/RichTextEditor").then((mod) => mod.RichTextEditor),
  { ssr: false, loading: () => <p>Loading editor…</p> },
);

type Game = "bgmi" | "pubg";

type InitialData = {
  bgmiHtml: string;
  pubgHtml: string;
  bgmiUsingDefault: boolean;
  pubgUsingDefault: boolean;
};

type Props = {
  initialData?: InitialData;
};

export default function AdminGameArticlesClient({ initialData }: Props) {
  const [game, setGame] = useState<Game>("bgmi");
  const [bgmiHtml, setBgmiHtml] = useState(initialData?.bgmiHtml ?? "");
  const [pubgHtml, setPubgHtml] = useState(initialData?.pubgHtml ?? "");
  const [bgmiDefault, setBgmiDefault] = useState(initialData?.bgmiUsingDefault ?? true);
  const [pubgDefault, setPubgDefault] = useState(initialData?.pubgUsingDefault ?? true);
  const [editorNonce, setEditorNonce] = useState(0);
  const [loading, setLoading] = useState(initialData === undefined);
  const [saving, setSaving] = useState(false);
  const setMessage = useAdminFlash();

  const html = game === "bgmi" ? bgmiHtml : pubgHtml;
  const usingDefault = game === "bgmi" ? bgmiDefault : pubgDefault;

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/game-articles", {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        setMessage("Failed to load game articles.");
        return;
      }
      const json = (await res.json()) as { data?: InitialData };
      if (json.data) {
        setBgmiHtml(json.data.bgmiHtml);
        setPubgHtml(json.data.pubgHtml);
        setBgmiDefault(json.data.bgmiUsingDefault);
        setPubgDefault(json.data.pubgUsingDefault);
        setEditorNonce((n) => n + 1);
      }
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

  function setHtml(value: string) {
    if (game === "bgmi") setBgmiHtml(value);
    else setPubgHtml(value);
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
      if (game === "bgmi") {
        setBgmiHtml(json.html ?? "");
        setBgmiDefault(Boolean(json.usingDefault));
      } else {
        setPubgHtml(json.html ?? "");
        setPubgDefault(Boolean(json.usingDefault));
      }
      setMessage(
        json.usingDefault
          ? `${game === "bgmi" ? "BGMI" : "PUBG Mobile"} article cleared — site will show the built-in default.`
          : `${game === "bgmi" ? "BGMI" : "PUBG Mobile"} article saved.`,
      );
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  async function clearToDefault() {
    if (!window.confirm("Clear custom article and use the built-in default on the site?")) return;
    setHtml("");
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
      if (game === "bgmi") {
        setBgmiHtml("");
        setBgmiDefault(true);
      } else {
        setPubgHtml("");
        setPubgDefault(true);
      }
      setEditorNonce((n) => n + 1);
      setMessage("Reverted to built-in default article.");
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
        Edit the long guide article under the calculator on <strong>BGMI</strong> (/) and{" "}
        <strong>PUBG Mobile</strong> (/pubg).         FAQ cards are still managed in{" "}
        <Link href="/admin/game-faqs" style={{ color: "var(--primary)" }}>
          Game FAQs
        </Link>
        . Free Fire articles:{" "}
        <Link href="/admin/pages" style={{ color: "var(--primary)" }}>
          Pages
        </Link>
        .
      </p>

      <div className="admin-news-actions-wrap" style={{ gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          className={`admin-news-btn ${game === "bgmi" ? "admin-news-btn-primary" : "admin-news-btn-edit"}`}
          onClick={() => switchGame("bgmi")}
        >
          BGMI article
        </button>
        <button
          type="button"
          className={`admin-news-btn ${game === "pubg" ? "admin-news-btn-primary" : "admin-news-btn-edit"}`}
          onClick={() => switchGame("pubg")}
        >
          PUBG Mobile article
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <form onSubmit={onSave}>
          <p style={{ fontSize: 13, color: usingDefault ? "#fbbf24" : "#5eead4", marginBottom: 10 }}>
            {usingDefault
              ? "Using built-in default article on the live site. Save custom HTML below to override."
              : "Custom article is live on the site."}
          </p>

          <RichTextEditor
            key={`game-article-${game}-${editorNonce}`}
            value={html}
            onChange={setHtml}
            storageKey={`bgmi_admin_game_article_${game}_v1`}
          />

          <div className="admin-news-actions-wrap" style={{ marginTop: 14, gap: 8 }}>
            <button type="submit" className="admin-news-btn admin-news-btn-primary" disabled={saving}>
              {saving ? "Saving…" : `Save ${game === "bgmi" ? "BGMI" : "PUBG"} article`}
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
              href={game === "bgmi" ? "/" : "/pubg"}
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
