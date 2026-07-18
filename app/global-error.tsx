"use client";

import { useEffect } from "react";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Root crash fallback (must include html/body; CSS from layout may be unavailable). */
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[global-error]", error);
    }
  }, [error]);

  const message = messageFromUnknownError(
    error,
    "Please try again in a moment. If it keeps happening, come back later.",
  );

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0b0e14",
          color: "#e6edf3",
          fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: 24,
          }}
        >
          <div
            role="alert"
            style={{
              width: "100%",
              maxWidth: 440,
              padding: "28px 22px",
              borderRadius: 14,
              border: "1px solid rgba(69, 196, 176, 0.22)",
              background: "#111826",
              textAlign: "center",
            }}
          >
            <p style={{ margin: "0 0 8px", color: "#45c4b0", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em" }}>
              500
            </p>
            <h1 style={{ margin: "0 0 10px", fontSize: 22, color: "#e6edf3" }}>Something went wrong</h1>
            <p style={{ margin: "0 0 20px", fontSize: 14, lineHeight: 1.5, color: "#9fb0c8" }}>{message}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              <button
                type="button"
                onClick={reset}
                style={{
                  appearance: "none",
                  border: "0",
                  borderRadius: 8,
                  padding: "10px 16px",
                  background: "#45c4b0",
                  color: "#0b0e14",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{
                  borderRadius: 8,
                  padding: "10px 16px",
                  border: "1px solid rgba(69, 196, 176, 0.35)",
                  color: "#45c4b0",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                Back to home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
