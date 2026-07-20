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

function subjectFromParams(searchParams: URLSearchParams) {
  const subject = searchParams.get("subject")?.trim();
  if (subject) return subject.slice(0, 120);
  const topic = searchParams.get("topic")?.trim().toLowerCase();
  if (topic === "report" || topic === "issue") return "Report an issue";
  return "";
}

export function ContactForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const prefill = subjectFromParams(searchParams);
    if (!prefill) return;
    setForm((prev) => (prev.subject ? prev : { ...prev, subject: prefill }));
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
        body: JSON.stringify(form),
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
