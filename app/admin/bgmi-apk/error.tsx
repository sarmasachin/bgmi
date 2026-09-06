"use client";

import { useEffect } from "react";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Admin route error for /admin/bgmi-apk. */
export default function AdminBgmiApkError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[admin/bgmi-apk/error]", error);
    }
  }, [error]);

  const message = messageFromUnknownError(
    error,
    "Something went wrong while loading the BGMI APK admin page.",
  );

  return (
    <section className="admin-section" style={{ maxWidth: 520 }}>
      <h1>BGMI APK — error</h1>
      <p className="admin-dashboard-subtitle">{message}</p>
      <button type="button" className="btn-calc" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
