/** Readable flag set only beside a valid admin session. Not used for auth. */
export const ADMIN_NO_ADS_COOKIE = "bgmi_admin_no_ads";

export function readAdminNoAdsFlag(cookieHeader: string | null | undefined): boolean {
  if (!cookieHeader) return false;
  const needle = `${ADMIN_NO_ADS_COOKIE}=1`;
  return cookieHeader.split(";").some((part) => part.trim() === needle);
}
