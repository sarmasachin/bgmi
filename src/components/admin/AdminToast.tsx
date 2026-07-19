"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AdminToastType = "success" | "warning" | "error";

type AdminToastItem = {
  id: string;
  type: AdminToastType;
  message: string;
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
    m.includes("rejected")
  ) {
    return "error";
  }
  return "success";
}

function toastLabel(type: AdminToastType) {
  if (type === "success") return "Success";
  if (type === "warning") return "Warning";
  return "Failed";
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
      setToasts((prev) => [...prev.slice(-(MAX_TOASTS - 1)), { id, type, message: text }]);
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
          >
            <div className="admin-toast-body">
              <span className="admin-toast-label">{toastLabel(toast.type)}</span>
              <p className="admin-toast-message">{toast.message}</p>
            </div>
            <button
              type="button"
              className="admin-toast-close"
              aria-label="Dismiss notification"
              onClick={() => dismiss(toast.id)}
            >
              ×
            </button>
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
