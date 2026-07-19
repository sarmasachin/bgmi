/** In-memory admin login lockout: 5 failed passwords → 10 minute block (per IP). */

const MAX_FAILS = 5;
const LOCK_MS = 10 * 60 * 1000;

type LockState = {
  fails: number;
  lockedUntil: number;
};

const byIp = new Map<string, LockState>();

function clientIp(request: { headers: Headers }): string {
  // Prefer proxy-set real IP; fall back to first X-Forwarded-For hop.
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "local";
}

export function getAdminLoginLockKey(request: { headers: Headers }): string {
  return clientIp(request);
}

export function getAdminLoginLockStatus(key: string): {
  locked: boolean;
  retryAfterSec: number;
} {
  const now = Date.now();
  const state = byIp.get(key);
  if (!state || state.lockedUntil <= now) {
    if (state && state.lockedUntil > 0 && state.lockedUntil <= now) {
      byIp.delete(key);
    }
    return { locked: false, retryAfterSec: 0 };
  }
  return {
    locked: true,
    retryAfterSec: Math.max(1, Math.ceil((state.lockedUntil - now) / 1000)),
  };
}

/** Call after a failed password check. Returns lock status after this fail. */
export function recordAdminLoginFailure(key: string): {
  locked: boolean;
  fails: number;
  retryAfterSec: number;
} {
  const now = Date.now();
  let state = byIp.get(key);
  if (!state || (state.lockedUntil > 0 && state.lockedUntil <= now)) {
    state = { fails: 0, lockedUntil: 0 };
  }
  if (state.lockedUntil > now) {
    return {
      locked: true,
      fails: state.fails,
      retryAfterSec: Math.max(1, Math.ceil((state.lockedUntil - now) / 1000)),
    };
  }

  state.fails += 1;
  if (state.fails >= MAX_FAILS) {
    state.lockedUntil = now + LOCK_MS;
    state.fails = MAX_FAILS;
    byIp.set(key, state);
    return { locked: true, fails: state.fails, retryAfterSec: Math.ceil(LOCK_MS / 1000) };
  }

  byIp.set(key, state);
  return { locked: false, fails: state.fails, retryAfterSec: 0 };
}

export function clearAdminLoginFailures(key: string): void {
  byIp.delete(key);
}

export function formatLockMessage(retryAfterSec: number): string {
  const mins = Math.max(1, Math.ceil(retryAfterSec / 60));
  return `Too many wrong passwords. Try again in ${mins} minute${mins === 1 ? "" : "s"}.`;
}
