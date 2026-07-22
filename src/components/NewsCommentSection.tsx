"use client";

import { FormEvent, useRef, useState } from "react";
import { UserErrorBanner } from "@/src/components/ui/UserErrorBanner";
import { messageFromUnknownError, readApiError } from "@/src/lib/userFacingError";
import type { PublicComment } from "@/src/server/repositories/commentsRepository";

type Props = {
  newsId: string;
  initialComments?: PublicComment[];
};

function formatCommentDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function NewsCommentSection({ newsId, initialComments = [] }: Props) {
  const submittingRef = useRef(false);
  const [comments] = useState<PublicComment[]>(initialComments);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (submittingRef.current || submitting) return;

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
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
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsId,
          name: trimmedName.slice(0, 80),
          message: trimmedMessage.slice(0, 1000),
        }),
      });

      if (!res.ok) {
        setError(await readApiError(res, "Could not submit your comment."));
        return;
      }

      setDone(true);
      setName("");
      setMessage("");
    } catch (err) {
      setError(messageFromUnknownError(err, "Could not submit your comment. Please try again."));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section className="news-comments" aria-labelledby="news-comments-title">
      <h2 id="news-comments-title" className="news-comments-title">
        Comments
      </h2>
      <p className="news-comments-lead">Share your thoughts. Comments appear after moderation.</p>

      <form className="news-comments-form" onSubmit={onSubmit} noValidate>
        <label className="news-comments-field">
          <span className="news-comments-label">
            Name <span className="news-comments-req">*</span>
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

        <label className="news-comments-field">
          <span className="news-comments-label">
            Comment <span className="news-comments-req">*</span>
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
          <span className="news-comments-hint">{message.trim().length}/1000</span>
        </label>

        <UserErrorBanner message={error} />

        {done ? (
          <p className="news-comments-success" role="status">
            Thanks — your comment is pending moderation.
          </p>
        ) : null}

        <button type="submit" className="news-comments-submit" disabled={submitting}>
          {submitting ? "Submitting…" : "Post comment"}
        </button>
      </form>

      <div className="news-comments-list">
        {comments.length === 0 ? (
          <p className="news-comments-empty">No comments yet. Be the first to comment.</p>
        ) : (
          <ul className="news-comments-items">
            {comments.map((item) => (
              <li key={item.id} className="news-comments-item">
                <div className="news-comments-item-head">
                  <span className="news-comments-item-name">{item.name}</span>
                  {item.createdAt ? (
                    <time className="news-comments-item-date" dateTime={item.createdAt}>
                      {formatCommentDate(item.createdAt)}
                    </time>
                  ) : null}
                </div>
                <p className="news-comments-item-message">{item.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
