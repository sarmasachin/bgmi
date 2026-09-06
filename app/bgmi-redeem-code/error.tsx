"use client";

import { useEffect } from "react";
import { UserErrorPanel } from "@/src/components/ui/UserErrorPanel";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Route error UI for /bgmi-redeem-code (SSR/render failures). */
export default function BgmiRedeemCodeError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[bgmi-redeem-code/error]", error);
    }
  }, [error]);

  return (
    <main className="user-error-page lite-redeem-page">
      <UserErrorPanel
        code="Error"
        title="BGMI redeem codes unavailable"
        message={messageFromUnknownError(
          error,
          "Something went wrong while loading BGMI redeem codes. Try again, or go back to BGMI home.",
        )}
        onRetry={reset}
        homeHref="/bgmi"
      />
    </main>
  );
}
