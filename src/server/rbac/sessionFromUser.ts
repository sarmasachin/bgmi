import {
  createAdminSessionToken,
} from "@/src/server/adminSession";
import type { AdminUserAuthSnapshot } from "@/src/server/repositories/adminUsersRepository";

/** Build signed session cookie value from DB auth snapshot. */
export async function createSessionTokenFromAuthSnapshot(
  snapshot: AdminUserAuthSnapshot,
): Promise<string> {
  return createAdminSessionToken({
    userId: snapshot.id,
    email: snapshot.email,
    role: snapshot.role,
    permissions: [...snapshot.permissions],
  });
}
