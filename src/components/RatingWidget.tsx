"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import type { RatingSummary } from "@/src/server/repositories/ratingSummaryRepository";
import { UserErrorBanner } from "@/src/components/ui/UserErrorBanner";
import { messageFromHttpStatus, messageFromUnknownError } from "@/src/lib/userFacingError";

export type RatingTargetType = "home" | "news" | "tool";

type Props = {
  title: string;
  targetType: RatingTargetType;
  /** News: post id. Tool: URL slug / page context (no leading slash). Omit for home. */
  targetId?: string;
  /**
   * Server-prefetched summary. When set (including `null` = DB unavailable),
   * skips the client `/api/ratings` GET round-trip.
   */
  initialSummary?: RatingSummary | null;
};

function storageKey(targetType: RatingTargetType, targetId?: string) {
  return `bgmi_rated_v1:${targetType}:${targetId ?? "home"}`;
}

export function RatingWidget({
  title,
  targetType,
  targetId,
  initialSummary,
}: Props) {
  const hasServerSummary = initialSummary !== undefined;
  const [value, setValue] = useState<number | null>(null);
  const [average, setAverage] = useState<number | null>(initialSummary?.average ?? null);
  const [count, setCount] = useState(initialSummary?.count ?? 0);
  const [loading, setLoading] = useState(!hasServerSummary);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  /** null = not checked yet (render nothing: avoids SSR/refresh flash before localStorage). */
  const [showUI, setShowUI] = useState<boolean | null>(null);

  const key = storageKey(targetType, targetId);

  useLayoutEffect(() => {
    try {
      const rated = typeof window !== "undefined" && window.localStorage.getItem(key) === "1";
      setShowUI(!rated);
    } catch {
      setShowUI(true);
    }
  }, [key]);

  useEffect(() => {
    let cancelled = false;
    if (hasServerSummary || showUI !== true) {
      return;
    }
    if (targetType === "news" && !targetId?.trim()) {
      setLoading(false);
      return;
    }
    if (targetType === "tool" && !targetId?.trim()) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({ targetType });
    if (targetId?.trim()) params.set("targetId", targetId.trim());

    void fetch(`/api/ratings?${params}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) {
          return { average: null, count: 0 };
        }
        return r.json() as Promise<{ average?: number | null; count?: number }>;
      })
      .then((j) => {
        if (cancelled) return;
        setAverage(typeof j.average === "number" ? j.average : null);
        setCount(typeof j.count === "number" ? j.count : 0);
      })
      .catch(() => {
        if (!cancelled) {
          setAverage(null);
          setCount(0);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hasServerSummary, showUI, targetType, targetId]);

  async function submit(stars: number) {
    if (showUI !== true || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          ...(targetId?.trim() ? { targetId: targetId.trim() } : {}),
          value: stars,
        }),
      });
      let data: {
        ok?: boolean;
        saved?: boolean;
        average?: number | null;
        count?: number;
        error?: string;
      } = {};
      try {
        data = (await res.json()) as typeof data;
      } catch {
        data = {};
      }
      if (!res.ok) {
        setError(messageFromHttpStatus(res.status, data.error || "Could not save your rating."));
        return;
      }
      if (data.saved === false) {
        setError("Ratings are temporarily unavailable. Please try again later.");
        return;
      }
      setValue(stars);
      setShowUI(false);
      try {
        window.localStorage.setItem(key, "1");
      } catch {
        /* ignore */
      }
      if (typeof data.count === "number") setCount(data.count);
      if (typeof data.average === "number") setAverage(data.average);
    } catch (err) {
      setError(messageFromUnknownError(err, "Could not save your rating. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  if (showUI !== true) {
    return null;
  }

  const summaryLine =
    !loading && count > 0 && average != null ? (
      <p className="rating-widget-summary">
        {average.toFixed(1)} ★ · {count} {count === 1 ? "rating" : "ratings"}
      </p>
    ) : null;

  return (
    <section className="rating-widget">
      <p>{title}</p>
      {summaryLine}
      <div className={submitting ? "rating-widget-stars is-busy" : "rating-widget-stars"}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            disabled={submitting}
            className={value != null && star <= value ? "active" : ""}
            onClick={() => {
              void submit(star);
            }}
            aria-label={`Rate ${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
      {error ? <UserErrorBanner message={error} /> : null}
    </section>
  );
}
