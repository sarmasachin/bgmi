"use client";

import Link from "next/link";

type Props = {
  title?: string;
  message?: string;
  code?: string;
  onRetry?: () => void;
  homeHref?: string;
  /** Compact = nested section; full = page-level. */
  variant?: "page" | "section";
};

export function UserErrorPanel({
  title = "Something went wrong",
  message = "Please try again in a moment.",
  code,
  onRetry,
  homeHref = "/",
  variant = "page",
}: Props) {
  const Heading = variant === "page" ? "h1" : "h2";

  return (
    <div className={`user-error-panel user-error-panel--${variant}`} role="alert">
      {code ? <p className="user-error-panel-code">{code}</p> : null}
      <Heading className="user-error-panel-title">{title}</Heading>
      <p className="user-error-panel-message">{message}</p>
      <div className="user-error-panel-actions">
        {onRetry ? (
          <button type="button" className="user-error-panel-btn user-error-panel-btn--primary" onClick={onRetry}>
            Try again
          </button>
        ) : null}
        <Link href={homeHref} className="user-error-panel-btn user-error-panel-btn--ghost">
          Back to home
        </Link>
      </div>
    </div>
  );
}
