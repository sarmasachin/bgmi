"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AdminToastType = "success" | "warning" | "error";

type AdminToastItem = {
  id: string;
  type: AdminToastType;
  message: string;
  createdAt: number;
};

type AdminToastApi = {
  success: (message: string) => void;
  warning: (message: string) => void;
  error: (message: string) => void;
  failed: (message: string) => void;
  notify: (message: string) => void;
};

const TOAST_MS = 4200;
const MAX_TOASTS = 5;

const AdminToastContext = createContext<AdminToastApi | null>(null);

function classifyMessage(message: string): AdminToastType {
  const m = message.toLowerCase();
  if (
    m.startsWith("warning") ||
    m.includes("warning:") ||
    m.includes("already exists") ||
    m.includes("choose a") ||
    m.includes("required") ||
    m.includes("must be") ||
    m.includes("do not match") ||
    m.includes("passwords do not") ||
    m.includes("select at least") ||
    m.includes("limit reached") ||
    m.includes("reject one") ||
    m.includes("reject extras") ||
    m.includes("marked pending")
  ) {
    return "warning";
  }
  if (
    m.includes("fail") ||
    m.includes("error") ||
    m.includes("invalid") ||
    m.includes("unauthorized") ||
    m.includes("permission") ||
    m.includes("could not") ||
    m.includes("denied") ||
    m.includes("not found") ||
    m.includes("unavailable") ||
    m.includes("expired") ||
    m.includes("busy") ||
    m.includes("unable") ||
    m.includes("rejected") ||
    m.includes("credentials") ||
    m.includes("network")
  ) {
    return "error";
  }
  return "success";
}

function ToastIcon({ type }: { type: AdminToastType }) {
  if (type === "success") {
    return (
      <svg className="admin-toast-icon-svg" viewBox="0 0 20 20" aria-hidden>
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.25a1 1 0 0 1-1.43.01L3.29 9.96a1 1 0 1 1 1.42-1.41l3.07 3.09 6.5-6.55a1 1 0 0 1 1.424-.01Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (type === "warning") {
    return (
      <svg className="admin-toast-icon-svg" viewBox="0 0 20 20" aria-hidden>
        <path
          fill="currentColor"
          d="M10 6.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V7A.75.75 0 0 1 10 6.25Zm0 7.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
        />
      </svg>
    );
  }
  return (
    <svg className="admin-toast-icon-svg" viewBox="0 0 20 20" aria-hidden>
      <path
        fill="currentColor"
        d="M5.47 5.47a.75.75 0 0 1 1.06 0L10 8.94l3.47-3.47a.75.75 0 1 1 1.06 1.06L11.06 10l3.47 3.47a.75.75 0 1 1-1.06 1.06L10 11.06l-3.47 3.47a.75.75 0 0 1-1.06-1.06L8.94 10 5.47 6.53a.75.75 0 0 1 0-1.06Z"
      />
    </svg>
  );
}

function ToastTimer({ createdAt, durationMs }: { createdAt: number; durationMs: number }) {
  const [leftMs, setLeftMs] = useState(() => Math.max(0, durationMs - (Date.now() - createdAt)));

  useEffect(() => {
    const tick = () => {
      setLeftMs(Math.max(0, durationMs - (Date.now() - createdAt)));
    };
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [createdAt, durationMs]);

  const seconds = Math.max(1, Math.ceil(leftMs / 1000));

  return (
    <span className="admin-toast-timer" aria-hidden>
      {seconds}s
    </span>
  );
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<AdminToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: AdminToastType, message: string) => {
      const text = message.trim();
      if (!text) return;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const createdAt = Date.now();
      setToasts((prev) => [
        ...prev.slice(-(MAX_TOASTS - 1)),
        { id, type, message: text, createdAt },
      ]);
      window.setTimeout(() => dismiss(id), TOAST_MS);
    },
    [dismiss]
  );

  const api = useMemo<AdminToastApi>(
    () => ({
      success: (message) => push("success", message),
      warning: (message) => push("warning", message),
      error: (message) => push("error", message),
      failed: (message) => push("error", message),
      notify: (message) => {
        const text = message.trim();
        if (!text) return;
        push(classifyMessage(text), text);
      },
    }),
    [push]
  );

  return (
    <AdminToastContext.Provider value={api}>
      {children}
      <div className="admin-toast-stack" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`admin-toast admin-toast-${toast.type}`}
            role={toast.type === "error" ? "alert" : "status"}
            style={{ ["--admin-toast-ms" as string]: `${TOAST_MS}ms` }}
          >
            <span className="admin-toast-icon" aria-hidden>
              <ToastIcon type={toast.type} />
            </span>
            <div className="admin-toast-body">
              <p className="admin-toast-message">{toast.message}</p>
            </div>
            <div className="admin-toast-aside">
              <ToastTimer createdAt={toast.createdAt} durationMs={TOAST_MS} />
              <button
                type="button"
                className="admin-toast-close"
                aria-label="Dismiss notification"
                onClick={() => dismiss(toast.id)}
              >
                <svg viewBox="0 0 16 16" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z"
                  />
                </svg>
              </button>
            </div>
            <span className="admin-toast-progress" aria-hidden />
          </div>
        ))}
      </div>
    </AdminToastContext.Provider>
  );
}

export function useAdminToast(): AdminToastApi {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    throw new Error("useAdminToast must be used within AdminToastProvider");
  }
  return ctx;
}

/** Drop-in replacement for setMessage — shows bottom-right toast (success / warning / failed). */
export function useAdminFlash() {
  const toast = useAdminToast();
  return useCallback(
    (message: string) => {
      if (!message.trim()) return;
      toast.notify(message);
    },
    [toast]
  );
}
