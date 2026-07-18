"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { UserErrorPanel } from "@/src/components/ui/UserErrorPanel";
import { messageFromUnknownError } from "@/src/lib/userFacingError";

type Props = {
  children: ReactNode;
  /** Short label for this UI island (e.g. Reviews). */
  label?: string;
};

type State = {
  error: Error | null;
};

/**
 * Isolates client crashes so one widget cannot blank the whole calculator page.
 */
export class ClientErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[ClientErrorBoundary${this.props.label ? `:${this.props.label}` : ""}]`, error, info.componentStack);
    }
  }

  private retry = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      const label = this.props.label;
      return (
        <UserErrorPanel
          variant="section"
          title={label ? `${label} unavailable` : "This section failed to load"}
          message={messageFromUnknownError(
            this.state.error,
            "Something went wrong here. You can retry or keep using the rest of the page.",
          )}
          onRetry={this.retry}
        />
      );
    }
    return this.props.children;
  }
}
