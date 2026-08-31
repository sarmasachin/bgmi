/** Free Fire redeem code regional servers (admin-editable + public tabs). */

export type FreeFireRedeemServerConfig = {
  id: string;
  label: string;
  badge: string;
};

export type FreeFireRedeemServerTabId = "all" | string;

export const DEFAULT_FREE_FIRE_REDEEM_SERVERS: FreeFireRedeemServerConfig[] = [
  { id: "india", label: "India", badge: "IND" },
  { id: "brazil", label: "Brazil", badge: "BR" },
  { id: "indonesia", label: "Indonesia", badge: "ID" },
  { id: "taiwan", label: "Taiwan", badge: "TW" },
  { id: "global", label: "Global", badge: "Global" },
];

/** @deprecated Use string server ids from page CMS. */
export type FreeFireRedeemServerId = string;

/** Back-compat alias for older imports. */
export const FREE_FIRE_REDEEM_SERVERS = DEFAULT_FREE_FIRE_REDEEM_SERVERS;

export const FREE_FIRE_REDEEM_SERVER_TABS: ReadonlyArray<{
  id: FreeFireRedeemServerTabId;
  label: string;
}> = buildFreeFireRedeemServerTabs(DEFAULT_FREE_FIRE_REDEEM_SERVERS);

export function slugifyRedeemServerId(label: string): string {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "server";
}

export function ensureGlobalRedeemServer(
  servers: FreeFireRedeemServerConfig[],
): FreeFireRedeemServerConfig[] {
  const seen = new Set<string>();
  const out: FreeFireRedeemServerConfig[] = [];
  for (const row of servers) {
    const id = row.id.trim().toLowerCase();
    const label = row.label.trim();
    const badge = row.badge.trim() || label.slice(0, 4).toUpperCase() || "REG";
    if (!id || !label || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, label, badge });
  }
  if (!seen.has("global")) {
    out.push({ id: "global", label: "Global", badge: "Global" });
  }
  return out.length ? out : [{ id: "global", label: "Global", badge: "Global" }];
}

export function buildFreeFireRedeemServerTabs(servers: FreeFireRedeemServerConfig[]) {
  const list = ensureGlobalRedeemServer(servers);
  return [{ id: "all" as const, label: "All" }, ...list.map((s) => ({ id: s.id, label: s.label }))];
}

function serverList(servers?: readonly FreeFireRedeemServerConfig[]) {
  return ensureGlobalRedeemServer(
    servers?.length ? [...servers] : [...DEFAULT_FREE_FIRE_REDEEM_SERVERS],
  );
}

export function coerceFreeFireRedeemServer(
  raw: unknown,
  servers?: readonly FreeFireRedeemServerConfig[],
): string {
  const value = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  const list = serverList(servers);
  if (value && list.some((s) => s.id === value)) return value;
  return "global";
}

export function freeFireRedeemServerLabel(
  id: string,
  servers?: readonly FreeFireRedeemServerConfig[],
): string {
  return serverList(servers).find((s) => s.id === id)?.label ?? "Global";
}

export function freeFireRedeemServerBadge(
  id: string,
  servers?: readonly FreeFireRedeemServerConfig[],
): string {
  return serverList(servers).find((s) => s.id === id)?.badge ?? "Global";
}

/** Regional tab shows that server + Global codes. All/Global tabs are exact. */
export function codeMatchesFreeFireServerTab(
  server: string,
  tab: FreeFireRedeemServerTabId,
  servers?: readonly FreeFireRedeemServerConfig[],
): boolean {
  const normalized = coerceFreeFireRedeemServer(server, servers);
  if (tab === "all") return true;
  if (tab === "global") return normalized === "global";
  return normalized === tab || normalized === "global";
}

export function normalizeRedeemServerRow(raw: unknown): FreeFireRedeemServerConfig | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const src = raw as Record<string, unknown>;
  const label = typeof src.label === "string" ? src.label.trim() : "";
  const idRaw = typeof src.id === "string" ? src.id.trim().toLowerCase() : "";
  const id = idRaw || (label ? slugifyRedeemServerId(label) : "");
  const badgeRaw = typeof src.badge === "string" ? src.badge.trim() : "";
  const badge = badgeRaw || label.slice(0, 4).toUpperCase() || "REG";
  if (!id || !label) return null;
  return { id, label, badge };
}

export function normalizeRedeemServersList(raw: unknown): FreeFireRedeemServerConfig[] {
  if (!Array.isArray(raw)) return ensureGlobalRedeemServer([]);
  const parsed = raw
    .map((row) => normalizeRedeemServerRow(row))
    .filter((row): row is FreeFireRedeemServerConfig => Boolean(row));
  return ensureGlobalRedeemServer(parsed);
}
