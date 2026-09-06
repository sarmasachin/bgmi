"use client";

import { useEffect } from "react";
import { UserErrorPanel } from "@/src/components/ui/UserErrorPanel";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Route error UI for /pubg-redeem-code (SSR/render failures). */
export default function PubgRedeemCodeError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[pubg-redeem-code/error]", error);
    }
  }, [error]);

  return (
    <main className="user-error-page lite-redeem-page">
      <UserErrorPanel
        code="Error"
        title="PUBG Mobile redeem codes unavailable"
        message={messageFromUnknownError(
          error,
          "Something went wrong while loading PUBG Mobile redeem codes. Try again, or go back to PUBG Mobile home.",
        )}
        onRetry={reset}
        homeHref="/pubg"
      />
    </main>
  );
}
