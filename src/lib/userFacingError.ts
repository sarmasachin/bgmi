/**
 * Map fetch/API failures to short, user-safe copy (no raw stack traces).
 */
export function messageFromHttpStatus(status: number, fallback?: string): string {
  if (status === 400) return fallback || "Please check your input and try again.";
  if (status === 401 || status === 403) return "You don’t have permission to do that.";
  if (status === 404) return "We couldn’t find what you were looking for.";
  if (status === 408) return "Request timed out. Please try again.";
  if (status === 429) return "Too many requests. Please wait a minute and try again.";
  if (status === 503) return "Service temporarily unavailable. Please try again shortly.";
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  return fallback || "Something went wrong. Please try again.";
}

export function messageFromUnknownError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "You’re offline. Check your connection and try again.";
  }
  if (error instanceof TypeError && /fetch|network|failed/i.test(error.message)) {
    return "Network error. Check your connection and try again.";
  }
  if (error instanceof Error && error.message.trim()) {
    // Never surface internal digests / prisma / stack-ish messages.
    const msg = error.message.trim();
    if (/prisma|digest|econn|timeout|internal/i.test(msg)) return fallback;
    if (msg.length <= 120 && !msg.includes("\n")) return msg;
  }
  return fallback;
}

export async function readApiError(res: Response, fallback?: string): Promise<string> {
  let apiMessage = "";
  try {
    const data = (await res.json()) as { error?: unknown; message?: unknown };
    if (typeof data.error === "string" && data.error.trim()) apiMessage = data.error.trim();
    else if (typeof data.message === "string" && data.message.trim()) apiMessage = data.message.trim();
  } catch {
    /* non-JSON body */
  }
  return messageFromHttpStatus(res.status, apiMessage || fallback);
}
