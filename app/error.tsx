"use client";

import { useEffect } from "react";
import { UserErrorPanel } from "@/src/components/ui/UserErrorPanel";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[app/error]", error);
    }
  }, [error]);

  return (
    <main className="user-error-page">
      <UserErrorPanel
        code="Error"
        title="This page hit a problem"
        message={messageFromUnknownError(
          error,
          "Something went wrong while loading this page. Try again, or go back home.",
        )}
        onRetry={reset}
      />
    </main>
  );
}
