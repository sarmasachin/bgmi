import { GTA6_MAP_PINS } from "@/src/features/gta6Calculator/gta6-map";

const PIN_QUERY = "pin";

export function readPinIdFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  const id = new URLSearchParams(window.location.search).get(PIN_QUERY)?.trim().toLowerCase();
  if (!id) return null;
  return GTA6_MAP_PINS.some((pin) => pin.id === id) ? id : null;
}

/** Keep path + hash; set or clear `?pin=`. */
export function writePinIdToLocation(pinId: string | null) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (pinId) url.searchParams.set(PIN_QUERY, pinId);
  else url.searchParams.delete(PIN_QUERY);
  if (!url.hash) url.hash = "map";
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

export function buildPinShareUrl(pinId: string): string {
  if (typeof window === "undefined") return `?${PIN_QUERY}=${pinId}#map`;
  const url = new URL(window.location.href);
  url.searchParams.set(PIN_QUERY, pinId);
  url.hash = "map";
  return url.toString();
}
