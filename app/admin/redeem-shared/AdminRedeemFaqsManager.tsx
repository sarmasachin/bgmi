"use client";

import { useMemo, useState } from "react";
import { AdminDialogModal } from "@/src/components/admin/AdminDialogModal";

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#e2e8f0",
} as const;

export type AdminRedeemFaqItem = {
  id: string;
  question: string;
  answer: string;
};

function emptyFaq(): AdminRedeemFaqItem {
  return { id: `faq-${Date.now()}`, question: "", answer: "" };
}

type EditorState =
  | { mode: "create"; draft: AdminRedeemFaqItem }
  | { mode: "edit"; index: number; draft: AdminRedeemFaqItem };

type Props = {
  faqs: AdminRedeemFaqItem[];
  onChangeFaqs: (faqs: AdminRedeemFaqItem[]) => void;
};

/** Compact FAQ table + accessible modal editor (all redeem admins). */
export function AdminRedeemFaqsManager({ faqs, onChangeFaqs }: Props) {
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<EditorState | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        if (!q) return true;
        return (
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q)
        );
      });
  }, [faqs, query]);

  function openCreate() {
    setEditor({ mode: "create", draft: emptyFaq() });
  }

  function openEdit(index: number) {
    const item = faqs[index];
    if (!item) return;
    setEditor({ mode: "edit", index, draft: { ...item } });
  }

  function closeEditor() {
    setEditor(null);
  }

  function applyEditor() {
    if (!editor) return;
    const draft = {
      ...editor.draft,
      question: editor.draft.question.trim() || "New question?",
      answer: editor.draft.answer.trim() || "Answer here.",
    };
    if (editor.mode === "create") onChangeFaqs([...faqs, draft]);
    else onChangeFaqs(faqs.map((f, i) => (i === editor.index ? draft : f)));
    setEditor(null);
  }

  function removeAt(index: number) {
    const item = faqs[index];
    if (!item) return;
    const label = item.question.trim() || `FAQ #${index + 1}`;
    if (!window.confirm(`Remove FAQ “${label}”?`)) return;
    onChangeFaqs(faqs.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= faqs.length) return;
    const copy = [...faqs];
    const [row] = copy.splice(index, 1);
    copy.splice(next, 0, row!);
    onChangeFaqs(copy);
  }

  function patchDraft(patch: Partial<AdminRedeemFaqItem>) {
    setEditor((prev) => (prev ? { ...prev, draft: { ...prev.draft, ...patch } } : prev));
  }

  return (
    <div className="admin-redeem-manager">
      <div className="admin-redeem-toolbar">
        <div className="admin-redeem-stats">
          <span className="admin-redeem-stat">{faqs.length} FAQs</span>
        </div>
        <button type="button" className="admin-news-btn" onClick={openCreate}>
          Add FAQ
        </button>
      </div>

      <div className="admin-redeem-filters">
        <input
          className="admin-redeem-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          placeholder="Search questions…"
          aria-label="Search FAQs"
        />
      </div>

      <div className="admin-table-wrap admin-redeem-table-wrap">
        <table className="admin-table admin-redeem-table">
          <thead>
            <tr>
              <th style={{ width: 44 }}>#</th>
              <th>Question</th>
              <th>Answer preview</th>
              <th style={{ width: 210 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="admin-redeem-empty">
                  {faqs.length === 0
                    ? "No FAQs yet. Click Add FAQ to create one."
                    : "No FAQs match this search."}
                </td>
              </tr>
            ) : (
              rows.map(({ item, index }) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <strong className="admin-redeem-title">
                      {item.question || "Untitled question"}
                    </strong>
                  </td>
                  <td className="admin-redeem-schedule">
                    {item.answer.trim()
                      ? item.answer.trim().slice(0, 80) +
                        (item.answer.trim().length > 80 ? "…" : "")
                      : "—"}
                  </td>
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
                        disabled={index >= faqs.length - 1}
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
          title={editor.mode === "create" ? "Add FAQ" : "Edit FAQ"}
          subtitle="Apply updates the list. Save page publishes to the live site."
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
          <label className="admin-redeem-field">
            <span>Question</span>
            <input
              value={editor.draft.question}
              onChange={(e) => patchDraft({ question: e.target.value })}
              style={fieldStyle}
            />
          </label>
          <label className="admin-redeem-field">
            <span>Answer</span>
            <textarea
              value={editor.draft.answer}
              onChange={(e) => patchDraft({ answer: e.target.value })}
              rows={6}
              style={{ ...fieldStyle, resize: "vertical" }}
            />
          </label>
        </AdminDialogModal>
      ) : null}
    </div>
  );
}
