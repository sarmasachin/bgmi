export function logInfo(event: string, payload?: unknown) {
  // Replace with Sentry/Datadog integration in production.
  console.info(`[INFO] ${event}`, payload ?? "");
}

export function logError(event: string, error: unknown) {
  // Replace with Sentry/Datadog integration in production.
  console.error(`[ERROR] ${event}`, error);
}
