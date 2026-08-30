"use client";

import { useEffect } from "react";
import { UserErrorPanel } from "@/src/components/ui/UserErrorPanel";
import { FREE_FIRE_MAX_PATH } from "@/src/lib/freeFirePages";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Route error UI for /free-fire-max-stylish-name. */
export default function FreeFireMaxStylishNameError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[free-fire-max-stylish-name/error]", error);
    }
  }, [error]);

  return (
    <main className="user-error-page lite-stylish-page">
      <UserErrorPanel
        code="Error"
        title="FF Max stylish names unavailable"
        message={messageFromUnknownError(
          error,
          "Something went wrong while loading Free Fire Max stylish names. Try again, or go back to FF Max home.",
        )}
        onRetry={reset}
        homeHref={FREE_FIRE_MAX_PATH}
      />
    </main>
  );
}
