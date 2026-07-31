"use client";

import { useEffect, useRef } from "react";

const HISTORY_KEY = "adminEditor";

function isEditorState(state: unknown): boolean {
  return Boolean(
    state &&
      typeof state === "object" &&
      (state as Record<string, unknown>)[HISTORY_KEY] === true,
  );
}

/**
 * Keep browser Back inside the same admin module when an in-page editor is open.
 * Open → pushState; Back → close editor (stay on /admin/news etc.).
 */
export function useAdminEditorHistory(open: boolean, onBrowserBack: () => void) {
  const onBackRef = useRef(onBrowserBack);
  onBackRef.current = onBrowserBack;
  const ignoreNextPop = useRef(false);

  useEffect(() => {
    if (!open) return;

    window.history.pushState({ [HISTORY_KEY]: true }, "", window.location.href);

    const onPopState = () => {
      if (ignoreNextPop.current) {
        ignoreNextPop.current = false;
        return;
      }
      onBackRef.current();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [open]);

  /** Call before setShowForm(false) when closing via UI button. */
  function dismissEditorHistory() {
    if (!isEditorState(window.history.state)) return;
    ignoreNextPop.current = true;
    window.history.back();
  }

  return { dismissEditorHistory };
}
