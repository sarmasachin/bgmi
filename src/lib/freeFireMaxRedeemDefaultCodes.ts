import type { FreeFireRedeemCodeItem } from "@/src/lib/freeFireRedeemCodes";

/** Built-in illustrative Free Fire Max live codes (replace via Max admin/DB). */
export const DEFAULT_FREE_FIRE_MAX_REDEEM_CODES: FreeFireRedeemCodeItem[] = [
  {
    id: "ffm-diamond-01",
    title: "Max Diamond Weekend Boost",
    code: "FFM-DIAMOND-01",
    status: "live",
    server: "india",
    releasedLabel: "Released: 28 Aug, 02:30 PM",
    expiresLabel: "Expires: 30 Aug, 06:00 PM",
  },
  {
    id: "ffm-elite-pass",
    title: "Max Elite Pass Token Pack",
    code: "FFM-ELITE-PASS-88",
    status: "live",
    server: "global",
    releasedLabel: "Released: 29 Aug, 10:00 AM",
    expiresLabel: "Expires: 31 Aug, 11:59 PM",
  },
  {
    id: "ffm-crate-drop",
    title: "Max Weapon Crate Drop",
    code: "FFM-CRATE-DROP-07",
    status: "live",
    server: "brazil",
    releasedLabel: "Released: 27 Aug, 04:15 PM",
    expiresLabel: "Expires: 29 Aug, 09:00 PM",
  },
];
