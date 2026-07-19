"use client";

import { useCallback, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";

const AD_UNITS_API = "/api/admin/ad-units";

export type AdsRow = {
  id: string;
  slotKey: string;
  title: string;
  code: string | null;
  isEnabled: boolean;
  updatedAt: string;
};

export type PlacementState = {
  home: { home_above_calculator: boolean; home_between_tool_and_article: boolean };
  newsArticle: {
    news_detail_top: boolean;
    news_detail_mid: boolean;
    news_detail_bottom: boolean;
  };
};

function buildDrafts(rows: AdsRow[]) {
  const next: Record<string, { code: string; enabled: boolean }> = {};
  for (const r of rows) {
    next[r.id] = { code: r.code ?? "", enabled: r.isEnabled };
  }
  return next;
}

type Props = {
  initialRows: AdsRow[];
  initialPlacements: PlacementState;
};

export function AdminAdsForm({ initialRows, initialPlacements }: Props) {
  const [rows, setRows] = useState(initialRows);
  const [drafts, setDrafts] = useState(() => buildDrafts(initialRows));
  const [placements, setPlacements] = useState(initialPlacements);
  const setMessage = useAdminFlash();
  const [savingPlacements, setSavingPlacements] = useState(false);

  const reloadFromServer = useCallback(async () => {
    const opts = { cache: "no-store" as const, credentials: "include" as const };
    try {
      const adsRes = await fetch(AD_UNITS_API, opts);
      if (!adsRes.ok) return;
      const json = (await adsRes.json()) as { data?: AdsRow[] };
      const data = json.data ?? [];
      setRows(data);
      setDrafts(buildDrafts(data));
      try {
        const placeRes = await fetch(`${AD_UNITS_API}/placements`, opts);
        if (placeRes.ok) {
          const pj = (await placeRes.json()) as { data?: PlacementState };
          if (pj.data) setPlacements(pj.data);
        }
      } catch {
        /* ignore */
      }
    } catch {
      /* ignore */
    }
  }, []);

  async function savePlacements() {
    setSavingPlacements(true);
    setMessage("");
    try {
      const res = await fetch(`${AD_UNITS_API}/placements`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(placements),
      });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        setMessage(j.error ?? "Failed to save placements.");
        return;
      }
      setMessage("Placement visibility saved.");
    } catch {
      setMessage("Failed to save placements.");
    } finally {
      setSavingPlacements(false);
    }
  }

  async function save(id: string) {
    const d = drafts[id];
    if (!d) return;
    setMessage("");
    try {
      const res = await fetch(AD_UNITS_API, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: d.enabled, code: d.code }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setMessage(j.error ?? "Save failed.");
        return;
      }
      setMessage("Saved.");
      await reloadFromServer();
    } catch {
      setMessage("Network error. Please retry.");
    }
  }

  return (
    <section className="admin-section">
      <h1>Ad placements</h1>
      <p className="admin-dashboard-subtitle">
        Choose where slots may appear on the home page and news articles, then paste HTML per slot below. Only trusted admins should add snippets (they run as HTML/JS on the
        site). The sensitivity calculator layout is not changed.
      </p>

      <div className="admin-card" style={{ marginBottom: 20, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Where to show ads</h2>
        <p className="admin-dashboard-subtitle" style={{ marginTop: 4 }}>
          Uncheck a position to hide that slot on the live site (even if HTML is enabled below).
        </p>
        <fieldset style={{ border: "none", padding: 0, margin: "12px 0" }}>
          <legend style={{ fontWeight: 600, marginBottom: 8 }}>Home page</legend>
          <label className="admin-ads-enable" style={{ display: "block", marginBottom: 6 }}>
            <input
              type="checkbox"
              checked={placements.home.home_above_calculator}
              onChange={(e) =>
                setPlacements((p) => ({
                  ...p,
                  home: { ...p.home, home_above_calculator: e.target.checked },
                }))
              }
            />
            Above calculator (before sensitivity tool)
          </label>
          <label className="admin-ads-enable" style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={placements.home.home_between_tool_and_article}
              onChange={(e) =>
                setPlacements((p) => ({
                  ...p,
                  home: { ...p.home, home_between_tool_and_article: e.target.checked },
                }))
              }
            />
            Between calculator and rating block
          </label>
        </fieldset>
        <fieldset style={{ border: "none", padding: 0, margin: "12px 0" }}>
          <legend style={{ fontWeight: 600, marginBottom: 8 }}>News article</legend>
          <label className="admin-ads-enable" style={{ display: "block", marginBottom: 6 }}>
            <input
              type="checkbox"
              checked={placements.newsArticle.news_detail_top}
              onChange={(e) =>
                setPlacements((p) => ({
                  ...p,
                  newsArticle: { ...p.newsArticle, news_detail_top: e.target.checked },
                }))
              }
            />
            Below title (before hero image)
          </label>
          <label className="admin-ads-enable" style={{ display: "block", marginBottom: 6 }}>
            <input
              type="checkbox"
              checked={placements.newsArticle.news_detail_mid}
              onChange={(e) =>
                setPlacements((p) => ({
                  ...p,
                  newsArticle: { ...p.newsArticle, news_detail_mid: e.target.checked },
                }))
              }
            />
            Below article body
          </label>
          <label className="admin-ads-enable" style={{ display: "block" }}>
            <input
              type="checkbox"
              checked={placements.newsArticle.news_detail_bottom}
              onChange={(e) =>
                setPlacements((p) => ({
                  ...p,
                  newsArticle: { ...p.newsArticle, news_detail_bottom: e.target.checked },
                }))
              }
            />
            Above rating widget
          </label>
        </fieldset>
        <button
          type="button"
          className="admin-pages-btn admin-pages-btn-preview"
          disabled={savingPlacements}
          onClick={() => void savePlacements()}
        >
          {savingPlacements ? "Saving…" : "Save placement visibility"}
        </button>
      </div>

      <div className="admin-ads-slot-list">
        {rows.map((r) => (
          <div key={r.id} className="admin-card admin-ads-slot-card">
            <h3>{r.title}</h3>
            <code className="admin-ads-slot-key">{r.slotKey}</code>
            <label className="admin-ads-enable">
              <input
                type="checkbox"
                checked={drafts[r.id]?.enabled ?? false}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [r.id]: { ...(prev[r.id] ?? { code: "", enabled: false }), enabled: e.target.checked },
                  }))
                }
              />
              Enabled
            </label>
            <textarea
              className="admin-ads-code"
              value={drafts[r.id]?.code ?? ""}
              onChange={(e) =>
                setDrafts((prev) => ({
                  ...prev,
                  [r.id]: { ...(prev[r.id] ?? { code: "", enabled: false }), code: e.target.value },
                }))
              }
              placeholder="<!-- Paste ad unit HTML -->"
              spellCheck={false}
            />
            <button
              type="button"
              className="admin-pages-btn admin-pages-btn-preview"
              onClick={() => {
                void save(r.id);
              }}
            >
              Save slot
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
