import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import type { Gta6MapPin } from "@/src/features/gta6Calculator/gta6-map";
import { GTA6_MAP_IMAGE } from "@/src/features/gta6Calculator/gta6-map";

/** Matches Leonida basemap ocean (edge pe black/white mat dikhao). */
const MAP_OCEAN = "#1f7eb5";

export type Gta6LeafletHandles = {
  map: LeafletMap;
  markers: Map<string, LeafletMarker>;
  destroy: () => void;
  flyToPin: (pin: Gta6MapPin) => void;
  resetView: () => void;
  setActive: (id: string) => void;
  setVisibleIds: (ids: ReadonlySet<string>) => void;
};

function pctToLatLng(L: typeof import("leaflet"), x: number, y: number) {
  const w = GTA6_MAP_IMAGE.width;
  const h = GTA6_MAP_IMAGE.height;
  return L.latLng(h * (1 - y / 100), (w * x) / 100);
}

function pinIcon(L: typeof import("leaflet"), active: boolean) {
  return L.divIcon({
    className: active ? "gta6-leaflet-pin is-active" : "gta6-leaflet-pin",
    html: `<span class="gta6-leaflet-dot" aria-hidden="true"></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

export async function createGta6LeafletMap(
  el: HTMLElement,
  pins: readonly Gta6MapPin[],
  opts: {
    activeId: string;
    onSelect: (id: string) => void;
  },
): Promise<Gta6LeafletHandles> {
  const L = (await import("leaflet")).default;

  if ((el as HTMLElement & { _leaflet_id?: number })._leaflet_id) {
    el.innerHTML = "";
    delete (el as HTMLElement & { _leaflet_id?: number })._leaflet_id;
  }

  const w = GTA6_MAP_IMAGE.width;
  const h = GTA6_MAP_IMAGE.height;
  const bounds = L.latLngBounds([0, 0], [h, w]);
  const isCoarse =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;

  const map = L.map(el, {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 3,
    zoomSnap: isCoarse ? 0.25 : 0.05,
    zoomDelta: isCoarse ? 0.5 : 0.35,
    attributionControl: false,
    zoomControl: true,
    preferCanvas: true,
    doubleClickZoom: true,
    touchZoom: true,
    tapTolerance: isCoarse ? 22 : 15,
    bounceAtZoomLimits: true,
    inertia: true,
    inertiaDeceleration: isCoarse ? 2500 : 3000,
    zoomAnimation: true,
    fadeAnimation: true,
  });

  el.style.background = MAP_OCEAN;

  const overlay = L.imageOverlay(GTA6_MAP_IMAGE.src, bounds, {
    opacity: 1,
    interactive: false,
  }).addTo(map);

  const fit = () => {
    map.invalidateSize();
    map.fitBounds(bounds, { padding: [12, 12], animate: false });
  };

  fit();
  requestAnimationFrame(fit);
  window.setTimeout(fit, 60);
  window.setTimeout(fit, 250);
  overlay.on("load", fit);

  // Soft limit only — free pan/zoom; edge pe ocean bg dikhe, lock nahi.
  map.setMaxBounds(bounds.pad(0.35));
  map.options.maxBoundsViscosity = 0.2;

  const mapContainer = map.getContainer();
  const blockTouchScroll = (e: TouchEvent) => {
    if (e.touches.length >= 1) e.preventDefault();
  };
  mapContainer.addEventListener("touchmove", blockTouchScroll, { passive: false });

  const markers = new Map<string, LeafletMarker>();
  let activeId = opts.activeId;
  let visibleIds = new Set(pins.map((pin) => pin.id));

  const syncIcons = () => {
    for (const pin of pins) {
      const marker = markers.get(pin.id);
      if (!marker) continue;
      marker.setIcon(pinIcon(L, pin.id === activeId));
    }
  };

  const syncVisibility = () => {
    for (const pin of pins) {
      const marker = markers.get(pin.id);
      if (!marker) continue;
      const show = visibleIds.has(pin.id);
      const onMap = map.hasLayer(marker);
      if (show && !onMap) marker.addTo(map);
      if (!show && onMap) map.removeLayer(marker);
    }
  };

  for (const pin of pins) {
    const marker = L.marker(pctToLatLng(L, pin.x, pin.y), {
      icon: pinIcon(L, pin.id === opts.activeId),
      title: pin.name,
      riseOnHover: true,
      keyboard: true,
    }).addTo(map);

    marker.bindTooltip(pin.name, {
      direction: "top",
      offset: [0, -12],
      opacity: 0.95,
      className: "gta6-leaflet-tooltip",
    });

    marker.on("click", () => {
      opts.onSelect(pin.id);
      map.flyTo(pctToLatLng(L, pin.x, pin.y), pin.zoom ?? Math.max(map.getZoom(), 1.2), {
        duration: 0.5,
      });
    });

    markers.set(pin.id, marker);
  }

  syncIcons();

  return {
    map,
    markers,
    destroy: () => {
      mapContainer.removeEventListener("touchmove", blockTouchScroll);
      map.remove();
    },
    flyToPin: (pin) => {
      if (!visibleIds.has(pin.id)) return;
      map.flyTo(pctToLatLng(L, pin.x, pin.y), pin.zoom ?? 1.4, { duration: 0.5 });
    },
    resetView: () => {
      map.invalidateSize();
      map.fitBounds(bounds, { padding: [12, 12], animate: true, duration: 0.4 });
    },
    setActive: (id) => {
      activeId = id;
      syncIcons();
    },
    setVisibleIds: (ids) => {
      visibleIds = new Set(ids);
      syncVisibility();
    },
  };
}
