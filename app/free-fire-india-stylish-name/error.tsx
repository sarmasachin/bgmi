"use client";

import { useEffect } from "react";
import { UserErrorPanel } from "@/src/components/ui/UserErrorPanel";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Route error UI for /free-fire-india-stylish-name. */
export default function FreeFireIndiaStylishNameError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[free-fire-india-stylish-name/error]", error);
    }
  }, [error]);

  return (
    <main className="user-error-page lite-stylish-page">
      <UserErrorPanel
        code="Error"
        title="Free Fire India names unavailable"
        message={messageFromUnknownError(
          error,
          "Something went wrong while loading Free Fire India stylish names. Try again, or go back home.",
        )}
        onRetry={reset}
        homeHref="/"
      />
    </main>
  );
}
