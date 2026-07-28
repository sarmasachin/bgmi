"use client";

import { FormEvent, useState } from "react";
import { useAdminFlash } from "@/src/components/admin/AdminToast";
import {
  defaultContactSeo,
  type ContactSeo,
  type ContactSeoTopic,
} from "@/src/lib/listingSeoDefaults";
import { readApiError } from "@/src/lib/userFacingError";

type Props = {
  initialSeo: ContactSeo;
};

const TOPICS: Array<{ id: ContactSeoTopic; label: string }> = [
  { id: "general", label: "Contact (general)" },
  { id: "report", label: "Report Issue" },
  { id: "feedback", label: "Feedback" },
];

export function AdminContactSeoPanel({ initialSeo }: Props) {
  const setMessage = useAdminFlash();
  const [seo, setSeo] = useState<ContactSeo>(initialSeo);
  const [saving, setSaving] = useState(false);

  function patchTopic(topic: ContactSeoTopic, field: "title" | "description", value: string) {
    setSeo((prev) => ({
      ...prev,
      [topic]: { ...prev[topic], [field]: value },
    }));
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const payload: ContactSeo = {
        general: {
          title: seo.general.title.trim() || defaultContactSeo.general.title,
          description: seo.general.description.trim() || defaultContactSeo.general.description,
        },
        report: {
          title: seo.report.title.trim() || defaultContactSeo.report.title,
          description: seo.report.description.trim() || defaultContactSeo.report.description,
        },
        feedback: {
          title: seo.feedback.title.trim() || defaultContactSeo.feedback.title,
          description: seo.feedback.description.trim() || defaultContactSeo.feedback.description,
        },
      };
      const res = await fetch("/api/admin/contact-seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setMessage(await readApiError(res, "Could not save contact SEO."));
        return;
      }
      const json = (await res.json()) as { seo?: ContactSeo };
      if (json.seo) setSeo(json.seo);
      setMessage("Contact SEO saved.");
    } catch {
      setMessage("Network error. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-section" style={{ marginBottom: 16 }}>
      <h2 style={{ margin: "0 0 12px", fontSize: 16 }}>Contact page SEO</h2>
      <form onSubmit={onSave}>
        {TOPICS.map((topic) => (
          <div
            key={topic.id}
            style={{
              marginBottom: 14,
              padding: 12,
              borderRadius: 10,
              border: "1px solid #1e293b",
              background: "#0b1220",
            }}
          >
            <p style={{ margin: "0 0 10px", fontWeight: 600, fontSize: 13 }}>{topic.label}</p>
            <div className="form-group">
              <label htmlFor={`contactSeoTitle-${topic.id}`}>Meta title</label>
              <input
                id={`contactSeoTitle-${topic.id}`}
                value={seo[topic.id].title}
                onChange={(e) => patchTopic(topic.id, "title", e.target.value)}
                maxLength={160}
                placeholder={defaultContactSeo[topic.id].title}
              />
            </div>
            <div className="form-group">
              <label htmlFor={`contactSeoDesc-${topic.id}`}>Meta description</label>
              <textarea
                id={`contactSeoDesc-${topic.id}`}
                value={seo[topic.id].description}
                onChange={(e) => patchTopic(topic.id, "description", e.target.value)}
                rows={2}
                maxLength={320}
                placeholder={defaultContactSeo[topic.id].description}
              />
            </div>
          </div>
        ))}
        <button type="submit" className="admin-news-btn admin-news-btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save contact SEO"}
        </button>
      </form>
    </section>
  );
}
