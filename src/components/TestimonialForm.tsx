"use client";

import { FormEvent, useId, useRef, useState } from "react";
import { UserErrorBanner } from "@/src/components/ui/UserErrorBanner";
import { messageFromUnknownError, readApiError } from "@/src/lib/userFacingError";

type Game = "bgmi" | "pubg";

type Props = {
  /** Locked to the current calculator page. */
  game: Game;
};

const GAME_LABEL: Record<Game, string> = {
  bgmi: "BGMI",
  pubg: "PUBG Mobile",
};

export function TestimonialForm({ game }: Props) {
  const panelId = useId();
  const submittingRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [phoneModel, setPhoneModel] = useState("");
  const [showName, setShowName] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const displayStars = hoverRating || rating;
  const gameLabel = GAME_LABEL[game];

  function pickStar(star: number) {
    if (submitting || submittingRef.current) return;
    if (done) {
      setDone(false);
      setError("");
    }
    setRating(star);
    setError("");
    setOpen(true);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    // Sync guard — React state alone cannot block a fast double-click.
    if (submittingRef.current || submitting) return;

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    const trimmedPhone = phoneModel.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }
    if (rating < 1 || rating > 5) {
      setError("Please select a star rating.");
      setOpen(true);
      return;
    }
    if (trimmedMessage.length < 2) {
      setError("Please write a short review (at least 2 characters).");
      return;
    }
    if (trimmedMessage.length > 300) {
      setError("Review must be 300 characters or less.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName.slice(0, 80),
          rating,
          message: trimmedMessage.slice(0, 300),
          game,
          phoneModel: trimmedPhone ? trimmedPhone.slice(0, 80) : null,
          showName,
        }),
      });

      if (!res.ok) {
        setError(await readApiError(res, "Could not submit your review."));
        return;
      }

      setDone(true);
      setOpen(false);
      setName("");
      setRating(0);
      setHoverRating(0);
      setMessage("");
      setPhoneModel("");
      setShowName(true);
    } catch (err) {
      setError(messageFromUnknownError(err, "Could not submit your review. Please try again."));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section className={`testimonial-form${open ? " is-open" : " is-collapsed"}`}>
      <div
        className={`testimonial-form-stars testimonial-form-stars-only${submitting ? " is-busy" : ""}`}
        role="group"
        aria-label="Your rating"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            className={star <= displayStars ? "is-active" : ""}
            disabled={submitting}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            aria-pressed={rating === star}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onFocus={() => setHoverRating(star)}
            onBlur={() => setHoverRating(0)}
            onClick={() => pickStar(star)}
          >
            ★
          </button>
        ))}
      </div>

      {done && !open ? (
        <p className="testimonial-form-success testimonial-form-success-inline" aria-live="polite">
          Thanks — your review is pending moderation.
        </p>
      ) : null}

      {open ? (
        <div id={panelId} className="testimonial-form-panel">
          <form className="testimonial-form-body" onSubmit={onSubmit} noValidate>
            <div className="testimonial-form-row">
              <div className="testimonial-form-group">
                <label className="testimonial-form-label" htmlFor="testimonial-name">
                  Name <span className="testimonial-form-req">*</span>
                </label>
                <input
                  id="testimonial-name"
                  className="testimonial-form-input"
                  value={name}
                  maxLength={80}
                  autoComplete="nickname"
                  disabled={submitting}
                  placeholder="Your display name"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="testimonial-form-group">
                <label className="testimonial-form-label" htmlFor="testimonial-game">
                  Game
                </label>
                <input
                  id="testimonial-game"
                  className="testimonial-form-input"
                  value={gameLabel}
                  readOnly
                  disabled
                  aria-readonly="true"
                />
              </div>
            </div>

            <div className="testimonial-form-group">
              <label className="testimonial-form-label" htmlFor="testimonial-message">
                Review <span className="testimonial-form-req">*</span>
              </label>
              <textarea
                id="testimonial-message"
                className="testimonial-form-textarea"
                value={message}
                maxLength={300}
                rows={2}
                disabled={submitting}
                placeholder="What helped you most? (max 300 characters)"
                onChange={(e) => setMessage(e.target.value)}
              />
              <p className="testimonial-form-hint">{message.trim().length}/300</p>
            </div>

            <div className="testimonial-form-group">
              <label className="testimonial-form-label" htmlFor="testimonial-phone">
                Phone model <span className="testimonial-form-optional">(optional)</span>
              </label>
              <input
                id="testimonial-phone"
                className="testimonial-form-input"
                value={phoneModel}
                maxLength={80}
                disabled={submitting}
                placeholder="e.g. Poco F5, iPhone 15"
                onChange={(e) => setPhoneModel(e.target.value)}
              />
            </div>

            <label className="testimonial-form-consent">
              <input
                type="checkbox"
                checked={showName}
                disabled={submitting}
                onChange={(e) => setShowName(e.target.checked)}
              />
              <span>Show my name on the website</span>
            </label>

            <UserErrorBanner message={error} />

            <button className="testimonial-form-submit" type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit review"}
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
