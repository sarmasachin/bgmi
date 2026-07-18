import { prisma } from "@/src/db/client";

/** Fail fast when DB host/credentials are wrong instead of hanging every page. */
const PRISMA_TIMEOUT_MS = process.env.NODE_ENV === "production" ? 2_000 : 400;
/** After first DB failure, skip Prisma briefly so every page does not pay the penalty. */
const DB_COOLDOWN_MS = 60_000;

let dbCooldownUntil = 0;

function isDbSkipped() {
  return Date.now() < dbCooldownUntil;
}

function markDbUnavailable() {
  dbCooldownUntil = Date.now() + DB_COOLDOWN_MS;
}

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Prisma timeout")), PRISMA_TIMEOUT_MS);
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
    return await withTimeout(runner());
  } catch {
    markDbUnavailable();
    return null;
  }
}

export { prisma };
