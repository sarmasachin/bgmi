"use client";

import { useEffect } from "react";
import { UserErrorPanel } from "@/src/components/ui/UserErrorPanel";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Route error UI for /free-fire-india-apk (SSR/render failures). */
export default function FreeFireIndiaApkError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[free-fire-india-apk/error]", error);
    }
  }, [error]);

  return (
    <main className="user-error-page">
      <UserErrorPanel
        code="Error"
        title="Free Fire India APK page unavailable"
        message={messageFromUnknownError(
          error,
          "Something went wrong while loading the Free Fire India APK page. Try again, or go back home.",
        )}
        onRetry={reset}
        homeHref="/"
      />
    </main>
  );
}
