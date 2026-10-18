import { cache } from "react";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/src/server/adminSession";

/** True when this request carries a signed, unexpired admin session. */
export const isAdminAdsHidden = cache(async () => {
  const store = await cookies();
  const session = await verifyAdminSessionToken(store.get(ADMIN_SESSION_COOKIE)?.value);
  return session != null;
});
