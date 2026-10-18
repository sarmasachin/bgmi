import { NextResponse } from "next/server";
import { ADMIN_NO_ADS_COOKIE } from "@/src/lib/adminNoAdsFlag";
import { ADMIN_SESSION_MAX_AGE_SEC } from "@/src/server/adminSession";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: false as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function setAdminNoAdsCookie(response: NextResponse) {
  response.cookies.set(ADMIN_NO_ADS_COOKIE, "1", cookieOptions(ADMIN_SESSION_MAX_AGE_SEC));
}

export function clearAdminNoAdsCookie(response: NextResponse) {
  response.cookies.set(ADMIN_NO_ADS_COOKIE, "", cookieOptions(0));
}

/** Set or clear the flag only when it does not already match the session. */
export function syncAdminNoAdsCookie(
  response: NextResponse,
  currentValue: string | undefined,
  loggedIn: boolean,
) {
  if (loggedIn && currentValue !== "1") {
    setAdminNoAdsCookie(response);
    return;
  }
  if (!loggedIn && currentValue) {
    clearAdminNoAdsCookie(response);
  }
}
