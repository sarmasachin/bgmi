"use client";

import { useEffect } from "react";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[admin/error]", error);
    }
  }, [error]);

  const message = messageFromUnknownError(
    error,
    "Something went wrong while loading this admin page.",
  );

  return (
    <section className="admin-section" style={{ maxWidth: 520 }}>
      <h1>Admin error</h1>
      <p className="admin-dashboard-subtitle">{message}</p>
      <button type="button" className="btn-calc" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
