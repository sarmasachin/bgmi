import { prisma } from "@/src/db/client";

export async function tryPrisma<T>(runner: () => Promise<T>): Promise<T | null> {
  try {
    if (!process.env.DATABASE_URL) {
      if (process.env.NODE_ENV === "production") throw new Error("DATABASE_URL is required");
      return null;
    }
    return await runner();
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    return null;
  }
}

export { prisma };
