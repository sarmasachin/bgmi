import { prisma } from "@/src/db/client";

/** Fail fast when DB host/credentials are wrong instead of hanging every page. */
const PRISMA_TIMEOUT_MS = process.env.NODE_ENV === "production" ? 2_000 : 400;
/** Admin writes (approve, etc.) need more headroom than public page loads. */
const PRISMA_LONG_TIMEOUT_MS = process.env.NODE_ENV === "production" ? 15_000 : 5_000;
/** After first DB failure, skip Prisma briefly so every page does not pay the penalty. */
const DB_COOLDOWN_MS = 60_000;

let dbCooldownUntil = 0;

function isDbSkipped() {
  return Date.now() < dbCooldownUntil;
}

function markDbUnavailable() {
  dbCooldownUntil = Date.now() + DB_COOLDOWN_MS;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Prisma timeout")), ms);
    }),
  ]);
}

export async function tryPrisma<T>(runner: () => Promise<T>): Promise<T | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (isDbSkipped()) {
    return null;
  }
  try {
    return await withTimeout(runner(), PRISMA_TIMEOUT_MS);
  } catch {
    markDbUnavailable();
    return null;
  }
}

/**
 * Longer timeout for admin mutations. Ignores short public-page cooldown so
 * approve/reject is not blocked after an unrelated slow public request.
 */
export async function tryPrismaLong<T>(runner: () => Promise<T>): Promise<T | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  try {
    return await withTimeout(runner(), PRISMA_LONG_TIMEOUT_MS);
  } catch (error) {
    // Business / validation errors must reach the API route (not mock fallback).
    if (
      error instanceof Error &&
      (error.message === "SLUG_EXISTS" ||
        error.message === "TITLE_EXISTS" ||
        error.message === "INVALID_SLUG" ||
        error.message === "DB_UNAVAILABLE")
    ) {
      throw error;
    }
    markDbUnavailable();
    return null;
  }
}

export { prisma };
