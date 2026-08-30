import type { FreeFireRedeemCodeItem } from "@/src/lib/freeFireRedeemCodes";

/** Illustrative expired archive codes (fan-made samples). */
export const DEFAULT_FREE_FIRE_REDEEM_EXPIRED_CODES: FreeFireRedeemCodeItem[] = [
  {
    id: "ff-exp-summer",
    title: "Summer Fest Diamond Code",
    code: "FF-SUMMER-OLD",
    status: "expired",
    server: "india",
    expiredOnLabel: "Expired on: 18 Aug, 06:00 PM",
  },
  {
    id: "ff-exp-monsoon",
    title: "Monsoon Week Bonus Pack",
    code: "FF-MONSOON-OLD",
    status: "expired",
    server: "global",
    expiredOnLabel: "Expired on: 10 Aug, 09:00 AM",
  },
  {
    id: "ff-exp-aug-flash",
    title: "August Flash Diamond Code",
    code: "FF-AUG-FLASH-OLD",
    status: "expired",
    server: "brazil",
    expiredOnLabel: "Expired on: 05 Aug, 11:59 PM",
  },
];
