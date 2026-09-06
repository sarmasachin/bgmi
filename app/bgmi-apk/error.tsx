"use client";

import { useEffect } from "react";
import { UserErrorPanel } from "@/src/components/ui/UserErrorPanel";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Route error UI for /bgmi-apk (SSR/render failures). */
export default function BgmiApkError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[bgmi-apk/error]", error);
    }
  }, [error]);

  return (
    <main className="user-error-page">
      <UserErrorPanel
        code="Error"
        title="BGMI APK page unavailable"
        message={messageFromUnknownError(
          error,
          "Something went wrong while loading the BGMI APK page. Try again, or go back home.",
        )}
        onRetry={reset}
        homeHref="/"
      />
    </main>
  );
}
