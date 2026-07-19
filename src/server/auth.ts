import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
  type AdminSessionPayload,
} from "@/src/server/adminSession";

export { ADMIN_SESSION_COOKIE } from "@/src/server/adminSession";

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(value);
}

export async function isAdminLoggedIn(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}
