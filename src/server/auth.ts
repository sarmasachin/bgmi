import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "bgmi_admin_session";

export function isValidAdminSession(value?: string) {
  return value === "active";
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return isValidAdminSession(value);
}
