"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

type Props = {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  actions: ReactNode;
};

/**
 * Admin modal with Escape-to-close, Tab focus trap, and focus restore.
 */
export function AdminDialogModal({ title, subtitle, onClose, children, actions }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  onCloseRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (!panel) return;

    function focusables(): HTMLElement[] {
      if (!panel) return [];
      return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
    }

    const initial = focusables()[0];
    initial?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0]!;
      const last = list[list.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, []);

  return (
    <div className="admin-modal-overlay" role="presentation" onClick={() => onCloseRef.current()}>
      <div
        ref={panelRef}
        className="admin-modal admin-redeem-editor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId}>{title}</h2>
        {subtitle ? <p className="admin-modal-subtitle">{subtitle}</p> : null}
        {children}
        <div className="admin-modal-actions">{actions}</div>
      </div>
    </div>
  );
}
