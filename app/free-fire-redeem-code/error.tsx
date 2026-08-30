"use client";

import { useEffect } from "react";
import { UserErrorPanel } from "@/src/components/ui/UserErrorPanel";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Route error UI for /free-fire-redeem-code (SSR/render failures). */
export default function FreeFireRedeemCodeError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[free-fire-redeem-code/error]", error);
    }
  }, [error]);

  return (
    <main className="user-error-page lite-redeem-page">
      <UserErrorPanel
        code="Error"
        title="Redeem codes unavailable"
        message={messageFromUnknownError(
          error,
          "Something went wrong while loading Free Fire redeem codes. Try again, or go back home.",
        )}
        onRetry={reset}
        homeHref="/"
      />
    </main>
  );
}
