"use client";

import { useState } from "react";
import type { HomeFaqItem } from "@/src/server/repositories/homeFaqRepository";

type Props = {
  items: HomeFaqItem[];
  /** Optional heading override. */
  title?: string;
};

/**
 * Exclusive accordion FAQ: opening one item closes any other open item.
 */
export function FaqAccordion({ items, title = "Frequently Asked Questions" }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!items.length) return null;

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="faq-section faq-accordion" lang="en">
      <h2>{title}</h2>
      <div className="faq-accordion-list">
        {items.map((item) => {
          const isOpen = openId === item.id;
          const panelId = `faq-panel-${item.id}`;
          const buttonId = `faq-button-${item.id}`;

          return (
            <div
              key={item.id}
              className={`faq-accordion-item${isOpen ? " is-open" : ""}`}
            >
              <button
                type="button"
                id={buttonId}
                className="faq-accordion-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
              >
                <span className="faq-accordion-question">{item.question}</span>
                <span className="faq-accordion-icon" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="faq-accordion-panel"
                hidden={!isOpen}
              >
                <p className="faq-accordion-answer">{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
