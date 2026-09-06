"use client";

import { useEffect } from "react";
import { UserErrorPanel } from "@/src/components/ui/UserErrorPanel";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Route error UI for /pubg-apk (SSR/render failures). */
export default function PubgApkError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[pubg-apk/error]", error);
    }
  }, [error]);

  return (
    <main className="user-error-page">
      <UserErrorPanel
        code="Error"
        title="PUBG Mobile APK page unavailable"
        message={messageFromUnknownError(
          error,
          "Something went wrong while loading the PUBG Mobile APK page. Try again, or go back home.",
        )}
        onRetry={reset}
        homeHref="/"
      />
    </main>
  );
}
