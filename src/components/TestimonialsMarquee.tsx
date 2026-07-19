"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicTestimonial, TestimonialGame } from "@/src/server/repositories/testimonialsRepository";

type Props = {
  game: TestimonialGame;
  /** Server-prefetched approved list for this game. */
  initialItems?: PublicTestimonial[];
};

const GAME_LABEL: Record<TestimonialGame, string> = {
  bgmi: "BGMI",
  pubg: "PUBG Mobile",
};

function Stars({ value }: { value: number }) {
  const safe = Math.min(5, Math.max(0, Math.round(value)));
  return (
    <span className="testimonials-marquee-stars" aria-label={`${safe} out of 5 stars`}>
      {"★".repeat(safe)}
      <span className="testimonials-marquee-stars-empty">{"★".repeat(5 - safe)}</span>
    </span>
  );
}

export function TestimonialsMarquee({ game, initialItems }: Props) {
  const [items, setItems] = useState<PublicTestimonial[]>(initialItems ?? []);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(initialItems !== undefined);

  useEffect(() => {
    if (initialItems !== undefined) {
      setItems(initialItems);
      setReady(true);
      return;
    }

    let cancelled = false;
    void fetch(`/api/testimonials?game=${game}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return { data: [] as PublicTestimonial[] };
        return res.json() as Promise<{ data?: PublicTestimonial[] }>;
      })
      .then((json) => {
        if (cancelled) return;
        setItems(Array.isArray(json.data) ? json.data : []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [game, initialItems]);

  const loopItems = useMemo(() => {
    if (items.length === 0) return [];

    // One or two reviews: show as a static row (no fake duplicates).
    if (items.length < 3) {
      return items.map((item, index) => ({
        ...item,
        loopKey: `static-${index}-${item.id}`,
      }));
    }

    // Enough cards for a wide track, then exact 2 copies for a seamless -50% loop.
    let base = [...items];
    while (base.length < 4) {
      base = base.concat(items);
    }

    return [
      ...base.map((item, index) => ({ ...item, loopKey: `a-${index}-${item.id}` })),
      ...base.map((item, index) => ({ ...item, loopKey: `b-${index}-${item.id}` })),
    ];
  }, [items]);

  const durationSec = Math.max(28, items.length * 6);
  const gameLabel = GAME_LABEL[game];
  const isStatic = items.length > 0 && items.length < 3;

  if (!ready) {
    return null;
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="testimonials-marquee" aria-label={`${gameLabel} player reviews`}>
      <div className="testimonials-marquee-head">
        <h2 className="testimonials-marquee-title">Player reviews</h2>
      </div>

      <div
        className={`testimonials-marquee-viewport${paused ? " is-paused" : ""}${isStatic ? " is-static" : ""}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div
          className={`testimonials-marquee-track${isStatic ? " is-static" : ""}`}
          style={isStatic ? undefined : { animationDuration: `${durationSec}s` }}
        >
          {loopItems.map((item) => (
            <article className="testimonials-marquee-card" key={item.loopKey}>
              <div className="testimonials-marquee-card-top">
                <Stars value={item.rating} />
                <span className="testimonials-marquee-game">
                  {GAME_LABEL[item.game]}
                </span>
              </div>
              <p className="testimonials-marquee-message">{item.message}</p>
              <div className="testimonials-marquee-meta">
                <strong>{item.name}</strong>
                {item.phoneModel ? <span>· {item.phoneModel}</span> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
