"use client";

import { useEffect } from "react";
import { UserErrorPanel } from "@/src/components/ui/UserErrorPanel";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Route error UI for /free-fire-stylish-name. */
export default function FreeFireStylishNameError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[free-fire-stylish-name/error]", error);
    }
  }, [error]);

  return (
    <main className="user-error-page lite-stylish-page">
      <UserErrorPanel
        code="Error"
        title="Stylish names unavailable"
        message={messageFromUnknownError(
          error,
          "Something went wrong while loading Free Fire stylish names. Try again, or go back home.",
        )}
        onRetry={reset}
        homeHref="/"
      />
    </main>
  );
}
