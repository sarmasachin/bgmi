"use client";

import { useEffect } from "react";
import { UserErrorPanel } from "@/src/components/ui/UserErrorPanel";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Route error UI for /free-fire-india-redeem-code (SSR/render failures). */
export default function FreeFireIndiaRedeemCodeError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[free-fire-india-redeem-code/error]", error);
    }
  }, [error]);

  return (
    <main className="user-error-page lite-redeem-page">
      <UserErrorPanel
        code="Error"
        title="Free Fire India redeem codes unavailable"
        message={messageFromUnknownError(
          error,
          "Something went wrong while loading Free Fire India redeem codes. Try again, or go back home.",
        )}
        onRetry={reset}
        homeHref="/"
      />
    </main>
  );
}
