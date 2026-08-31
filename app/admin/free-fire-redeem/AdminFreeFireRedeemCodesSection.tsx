"use client";

import { useMemo, useState } from "react";
import { AdminRedeemCodeScheduleFields } from "@/app/admin/redeem-shared/AdminRedeemCodeScheduleFields";
import { AdminDialogModal } from "@/src/components/admin/AdminDialogModal";
import type { FreeFireRedeemCodeItem } from "@/src/lib/freeFireRedeemCodes";
import {
  defaultExpiredRedeemSchedule,
  defaultLiveRedeemSchedule,
  finalizeRedeemScheduleDraft,
} from "@/src/lib/redeemCodeSchedule";
import {
  coerceFreeFireRedeemServer,
  ensureGlobalRedeemServer,
  freeFireRedeemServerBadge,
  type FreeFireRedeemServerConfig,
} from "@/src/lib/freeFireRedeemServers";

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
} as const;

export function emptyFreeFireRedeemCode(): FreeFireRedeemCodeItem {
  return {
    id: `new-${Date.now()}`,
    title: "",
    code: "",
    status: "live",
    server: "global",
    ...defaultLiveRedeemSchedule(),
  };
}

type FilterTab = "all" | "live" | "expired";

type EditorState =
  | { mode: "create"; draft: FreeFireRedeemCodeItem }
  | { mode: "edit"; index: number; draft: FreeFireRedeemCodeItem };

type Props = {
  codes: FreeFireRedeemCodeItem[];
  servers: FreeFireRedeemServerConfig[];
  onChangeCodes: (codes: FreeFireRedeemCodeItem[]) => void;
};

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="admin-redeem-field">
      <span>{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={fieldStyle} />
    </label>
  );
}

function scheduleLabel(item: FreeFireRedeemCodeItem): string {
  if (item.status === "expired") return item.expiredOnLabel?.trim() || "—";
  const bits = [item.releasedLabel, item.expiresLabel].map((s) => s?.trim()).filter(Boolean);
  return bits.length ? bits.join(" · ") : "—";
}

/** Compact redeem-code table + accessible modal editor (FF / FF Max admin). */
export function AdminFreeFireRedeemCodesSection({ codes, servers, onChangeCodes }: Props) {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<EditorState | null>(null);
  const serverList = ensureGlobalRedeemServer(servers);

  const liveCount = codes.filter((c) => c.status === "live").length;
  const expiredCount = codes.length - liveCount;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return codes
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        if (filter === "live" && item.status !== "live") return false;
        if (filter === "expired" && item.status !== "expired") return false;
        if (!q) return true;
        return (
          item.title.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          freeFireRedeemServerBadge(coerceFreeFireRedeemServer(item.server, serverList))
            .toLowerCase()
            .includes(q)
        );
      });
  }, [codes, filter, query]);

  function openCreate() {
    setEditor({ mode: "create", draft: emptyFreeFireRedeemCode() });
  }

  function openEdit(index: number) {
    const item = codes[index];
    if (!item) return;
    setEditor({ mode: "edit", index, draft: { ...item } });
  }

  function closeEditor() {
    setEditor(null);
  }

  function applyEditor() {
    if (!editor) return;
    const draft = finalizeRedeemScheduleDraft({
      ...editor.draft,
      title: editor.draft.title.trim() || "Untitled code",
      code: editor.draft.code.trim() || "CODE-HERE",
      server: coerceFreeFireRedeemServer(editor.draft.server, serverList),
    });
    if (editor.mode === "create") onChangeCodes([...codes, draft]);
    else onChangeCodes(codes.map((c, i) => (i === editor.index ? draft : c)));
    setEditor(null);
  }

  function removeAt(index: number) {
    const item = codes[index];
    if (!item) return;
    if (!window.confirm(`Remove code “${item.code || item.title}”?`)) return;
    onChangeCodes(codes.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= codes.length) return;
    const copy = [...codes];
    const [row] = copy.splice(index, 1);
    copy.splice(next, 0, row!);
    onChangeCodes(copy);
  }

  function patchDraft(patch: Partial<FreeFireRedeemCodeItem>) {
    setEditor((prev) => (prev ? { ...prev, draft: { ...prev.draft, ...patch } } : prev));
  }

  return (
    <div className="admin-redeem-manager">
      <div className="admin-redeem-toolbar">
        <div className="admin-redeem-stats">
          <span className="admin-redeem-stat">{codes.length} total</span>
          <span className="admin-redeem-stat is-live">{liveCount} live</span>
          <span className="admin-redeem-stat is-expired">{expiredCount} expired</span>
        </div>
        <button type="button" className="admin-news-btn" onClick={openCreate}>
          Add code
        </button>
      </div>

      <div className="admin-redeem-filters">
        {(
          [
            ["all", `All (${codes.length})`],
            ["live", `Live (${liveCount})`],
            ["expired", `Expired (${expiredCount})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`admin-redeem-filter${filter === id ? " is-active" : ""}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
        <input
          className="admin-redeem-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          placeholder="Search title, code, server…"
          aria-label="Search redeem codes"
        />
      </div>

      <p className="admin-redeem-hint">
        Compact list view — edit opens a panel. Global codes also show on every regional tab.
      </p>

      <div className="admin-table-wrap admin-redeem-table-wrap">
        <table className="admin-table admin-redeem-table">
          <thead>
            <tr>
              <th style={{ width: 44 }}>#</th>
              <th>Title</th>
              <th>Code</th>
              <th>Status</th>
              <th>Server</th>
              <th>Schedule</th>
              <th style={{ width: 210 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="admin-redeem-empty">
                  {codes.length === 0
                    ? "No codes yet. Click Add code to create one."
                    : "No codes match this filter."}
                </td>
              </tr>
            ) : (
              rows.map(({ item, index }) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong className="admin-redeem-title">{item.title || "Untitled"}</strong>
                  </td>
                  <td>
                    <code className="admin-redeem-code">{item.code || "—"}</code>
                  </td>
                  <td>
                    <span
                      className={`admin-redeem-pill${
                        item.status === "live" ? " is-live" : " is-expired"
                      }`}
                    >
                      {item.status === "live" ? "LIVE" : "EXPIRED"}
                    </span>
                  </td>
                  <td>{freeFireRedeemServerBadge(coerceFreeFireRedeemServer(item.server, serverList))}</td>
                  <td className="admin-redeem-schedule">{scheduleLabel(item)}</td>
                  <td>
                    <div className="admin-redeem-row-actions">
                      <button
                        type="button"
                        className="admin-news-btn admin-news-btn-edit"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="admin-news-btn admin-news-btn-edit"
                        onClick={() => move(index, 1)}
                        disabled={index >= codes.length - 1}
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="admin-news-btn admin-news-btn-edit"
                        onClick={() => openEdit(index)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-news-btn admin-news-btn-edit"
                        onClick={() => removeAt(index)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editor ? (
        <AdminDialogModal
          title={editor.mode === "create" ? "Add redeem code" : "Edit redeem code"}
          subtitle="Changes apply to this draft. Click Save page on the main form to publish."
          onClose={closeEditor}
          actions={
            <>
              <button type="button" className="admin-modal-btn-secondary" onClick={closeEditor}>
                Cancel
              </button>
              <button type="button" className="admin-modal-btn-primary" onClick={applyEditor}>
                {editor.mode === "create" ? "Add to list" : "Apply changes"}
              </button>
            </>
          }
        >
          <Field
            label="Title"
            value={editor.draft.title}
            onChange={(title) => patchDraft({ title })}
          />
          <Field
            label="Code"
            value={editor.draft.code}
            onChange={(code) => patchDraft({ code })}
          />
          <label className="admin-redeem-field">
            <span>Server / region</span>
            <select
              value={coerceFreeFireRedeemServer(editor.draft.server, serverList)}
              onChange={(e) => patchDraft({ server: e.target.value })}
              style={fieldStyle}
            >
              {serverList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-redeem-field">
            <span>Status</span>
            <select
              value={editor.draft.status}
              onChange={(e) => {
                const status = e.target.value === "expired" ? "expired" : "live";
                patchDraft(
                  status === "expired"
                    ? { status, ...defaultExpiredRedeemSchedule() }
                    : { status, ...defaultLiveRedeemSchedule() },
                );
              }}
              style={fieldStyle}
            >
              <option value="live">LIVE</option>
              <option value="expired">EXPIRED</option>
            </select>
          </label>
          <AdminRedeemCodeScheduleFields draft={editor.draft} onPatch={patchDraft} />
        </AdminDialogModal>
      ) : null}
    </div>
  );
}
