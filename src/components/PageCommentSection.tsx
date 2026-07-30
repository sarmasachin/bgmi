"use client";

import { FormEvent, useRef, useState } from "react";
import { UserErrorBanner } from "@/src/components/ui/UserErrorBanner";
import { messageFromUnknownError, readApiError } from "@/src/lib/userFacingError";
import type { PublicPageComment } from "@/src/server/repositories/pageCommentsRepository";

type Props = {
  pageKey: string;
  initialComments?: PublicPageComment[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatCommentDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PageCommentSection({ pageKey, initialComments = [] }: Props) {
  const submittingRef = useRef(false);
  const [comments] = useState<PublicPageComment[]>(initialComments);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submittingRef.current || submitting) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }
    if (trimmedEmail && !EMAIL_RE.test(trimmedEmail)) {
      setError("Please enter a valid email, or leave it blank.");
      return;
    }
    if (trimmedMessage.length < 2) {
      setError("Please write a comment (at least 2 characters).");
      return;
    }
    if (trimmedMessage.length > 1000) {
      setError("Comment must be 1000 characters or less.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    setDone(false);

    try {
      const res = await fetch("/api/page-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageKey,
          name: trimmedName.slice(0, 80),
          ...(trimmedEmail ? { email: trimmedEmail.slice(0, 200) } : {}),
          message: trimmedMessage.slice(0, 1000),
        }),
      });

      if (!res.ok) {
        setError(await readApiError(res, "Could not submit your comment."));
        return;
      }

      setDone(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(messageFromUnknownError(err, "Could not submit your comment. Please try again."));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section className="ff-as-comments" aria-labelledby="ff-as-comments-title">
      <div className="ff-as-comments-inner">
        <h2 id="ff-as-comments-title" className="ff-as-comments-title">
          Comments
        </h2>
        <p className="ff-as-comments-lead">
          Ask questions or share Advance Server tips. Comments appear here after admin approval.
        </p>

        <form className="ff-as-comments-form" onSubmit={onSubmit} noValidate>
          <label className="ff-as-comments-field">
            <span className="ff-as-comments-label">
              Name <span className="ff-as-comments-req">*</span>
            </span>
            <input
              type="text"
              name="name"
              autoComplete="nickname"
              required
              maxLength={80}
              value={name}
              disabled={submitting}
              placeholder="Your name"
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="ff-as-comments-field">
            <span className="ff-as-comments-label">
              Email <span className="ff-as-comments-optional">(optional)</span>
            </span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              maxLength={200}
              value={email}
              disabled={submitting}
              placeholder="you@email.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="ff-as-comments-field">
            <span className="ff-as-comments-label">
              Comment <span className="ff-as-comments-req">*</span>
            </span>
            <textarea
              name="message"
              required
              minLength={2}
              maxLength={1000}
              rows={4}
              value={message}
              disabled={submitting}
              placeholder="Write your comment…"
              onChange={(e) => setMessage(e.target.value)}
            />
            <span className="ff-as-comments-hint">{message.trim().length}/1000</span>
          </label>

          <UserErrorBanner message={error} />

          {done ? (
            <p className="ff-as-comments-success" role="status">
              Thanks — your comment is pending admin approval.
            </p>
          ) : null}

          <button type="submit" className="ff-as-comments-submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Post comment"}
          </button>
        </form>

        <div className="ff-as-comments-list">
          {comments.length === 0 ? (
            <p className="ff-as-comments-empty">No comments yet. Be the first to comment.</p>
          ) : (
            <ul className="ff-as-comments-items">
              {comments.map((item) => (
                <li key={item.id} className="ff-as-comments-item">
                  <div className="ff-as-comments-item-head">
                    <span className="ff-as-comments-item-name">{item.name}</span>
                    {item.createdAt ? (
                      <time className="ff-as-comments-item-date" dateTime={item.createdAt}>
                        {formatCommentDate(item.createdAt)}
                      </time>
                    ) : null}
                  </div>
                  <p className="ff-as-comments-item-message">{item.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
