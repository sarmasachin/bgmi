/** Free Fire redeem code regional servers (tabs + badges). */

export const FREE_FIRE_REDEEM_SERVERS = [
  { id: "india", label: "India", badge: "IND" },
  { id: "brazil", label: "Brazil", badge: "BR" },
  { id: "indonesia", label: "Indonesia", badge: "ID" },
  { id: "taiwan", label: "Taiwan", badge: "TW" },
  { id: "global", label: "Global", badge: "Global" },
] as const;

export type FreeFireRedeemServerId = (typeof FREE_FIRE_REDEEM_SERVERS)[number]["id"];

/** Tab filter ids: All + each server. */
export type FreeFireRedeemServerTabId = "all" | FreeFireRedeemServerId;

export const FREE_FIRE_REDEEM_SERVER_TABS: ReadonlyArray<{
  id: FreeFireRedeemServerTabId;
  label: string;
}> = [
  { id: "all", label: "All" },
  ...FREE_FIRE_REDEEM_SERVERS.map((s) => ({ id: s.id, label: s.label })),
];

const SERVER_IDS = new Set<string>(FREE_FIRE_REDEEM_SERVERS.map((s) => s.id));

export function coerceFreeFireRedeemServer(raw: unknown): FreeFireRedeemServerId {
  const value = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  if (SERVER_IDS.has(value)) return value as FreeFireRedeemServerId;
  return "global";
}

export function freeFireRedeemServerLabel(id: FreeFireRedeemServerId): string {
  return FREE_FIRE_REDEEM_SERVERS.find((s) => s.id === id)?.label ?? "Global";
}

export function freeFireRedeemServerBadge(id: FreeFireRedeemServerId): string {
  return FREE_FIRE_REDEEM_SERVERS.find((s) => s.id === id)?.badge ?? "Global";
}

/** Regional tab shows that server + Global codes. All/Global tabs are exact. */
export function codeMatchesFreeFireServerTab(
  server: FreeFireRedeemServerId,
  tab: FreeFireRedeemServerTabId,
): boolean {
  if (tab === "all") return true;
  if (tab === "global") return server === "global";
  return server === tab || server === "global";
}
