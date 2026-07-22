"use client";

import { useEffect, useState } from "react";

type Field = "title" | "slug";

/**
 * Debounced duplicate check against admin list APIs that return `{ exists: boolean }`.
 */
export function useAdminDuplicateCheck(options: {
  endpoint: "/api/admin/pages" | "/api/admin/news";
  field: Field;
  value: string;
  excludeId?: string | null;
  minLength?: number;
  enabled?: boolean;
}) {
  const {
    endpoint,
    field,
    value,
    excludeId = null,
    minLength = 1,
    enabled = true,
  } = options;
  const [exists, setExists] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setExists(false);
      return;
    }

    const trimmed = value.trim();
    if (trimmed.length < minLength) {
      setExists(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const params = new URLSearchParams({ [field]: trimmed });
          if (excludeId) params.set("excludeId", excludeId);
          const res = await fetch(`${endpoint}?${params.toString()}`, {
            cache: "no-store",
            credentials: "include",
          });
          if (!res.ok) {
            if (!cancelled) setExists(false);
            return;
          }
          const json = (await res.json()) as { exists?: boolean };
          if (!cancelled) setExists(Boolean(json.exists));
        } catch {
          if (!cancelled) setExists(false);
        }
      })();
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [endpoint, field, value, excludeId, minLength, enabled]);

  return exists;
}
