"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const INITIAL: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function topicFromParams(searchParams: URLSearchParams): "report" | "feedback" | "general" {
  const topic = searchParams.get("topic")?.trim().toLowerCase();
  if (topic === "report" || topic === "issue") return "report";
  if (topic === "feedback") return "feedback";
  return "general";
}

function subjectFromParams(searchParams: URLSearchParams) {
  const subject = searchParams.get("subject")?.trim();
  if (subject) return subject.slice(0, 120);
  const topic = topicFromParams(searchParams);
  if (topic === "report") return "Report Issue";
  if (topic === "feedback") return "Website feedback";
  return "";
}

const TOPIC_DEFAULT_SUBJECTS = new Set(["report issue", "report an issue", "website feedback"]);

export function ContactForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const topic = topicFromParams(searchParams);

  useEffect(() => {
    const prefill = subjectFromParams(searchParams);
    setForm((prev) => {
      const current = prev.subject.trim().toLowerCase();
      const isTopicDefault = !current || TOPIC_DEFAULT_SUBJECTS.has(current);
      if (!isTopicDefault) return prev;
      if (prev.subject === prefill) return prev;
      return { ...prev, subject: prefill };
    });
  }, [searchParams]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess(false);
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, topic }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Could not send message. Please try again.");
        return;
      }
      const keepSubject = subjectFromParams(searchParams);
      setForm({ ...INITIAL, subject: keepSubject });
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <div className="contact-form-grid">
        <label className="contact-field">
          <span className="contact-label">
            Full name <span className="contact-req">*</span>
          </span>
          <input
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={80}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Your name"
          />
        </label>

        <label className="contact-field">
          <span className="contact-label">
            Email <span className="contact-req">*</span>
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={200}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@example.com"
          />
        </label>
      </div>

      <label className="contact-field">
        <span className="contact-label">
          Subject <span className="contact-req">*</span>
        </span>
        <input
          name="subject"
          type="text"
          required
          minLength={3}
          maxLength={120}
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          placeholder="How can we help?"
        />
      </label>

      <label className="contact-field">
        <span className="contact-label">
          Message <span className="contact-req">*</span>
        </span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={7}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Tell us about your question, feedback, or issue..."
        />
      </label>

      {error ? (
        <p className="contact-alert contact-alert-error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="contact-alert contact-alert-success" role="status">
          Message sent. We&apos;ll get back to you soon.
        </p>
      ) : null}

      <button type="submit" className="contact-submit" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
