"use client";

import { useEffect } from "react";
import { UserErrorPanel } from "@/src/components/ui/UserErrorPanel";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Route error UI for /free-fire-max-apk (SSR/render failures). */
export default function FreeFireMaxApkError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[free-fire-max-apk/error]", error);
    }
  }, [error]);

  return (
    <main className="user-error-page">
      <UserErrorPanel
        code="Error"
        title="Free Fire MAX APK page unavailable"
        message={messageFromUnknownError(
          error,
          "Something went wrong while loading the Free Fire MAX APK page. Try again, or go back home.",
        )}
        onRetry={reset}
        homeHref="/"
      />
    </main>
  );
}
