/** Official Leonida places + pin coords on the community basemap image (pixel %). */

export const GTA6_MAP_IMAGE = {
  src: "/gta6/leonida-map.jpg",
  alt: "Interactive Leonida map — zoom, pan, and explore labeled locations",
  width: 2112,
  height: 2707,
  disclaimer:
    "Interactive community pre-release map — not official Rockstar. Zoom / pan freely. Pin spots match labels on this basemap for Rockstar-named places; coastlines and POIs can change before launch.",
} as const;

export type Gta6MapPin = {
  id: string;
  name: string;
  type: string;
  region: string;
  summary: string;
  /** Percent from left edge of the full map image (0–100). */
  x: number;
  /** Percent from top edge of the full map image (0–100). */
  y: number;
  zoom?: number;
};

export type Gta6MapFilter = "all" | "city" | "region" | "landmark";

export const GTA6_MAP_FILTERS: { id: Gta6MapFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "city", label: "Cities" },
  { id: "region", label: "Regions" },
  { id: "landmark", label: "Landmarks" },
];

export function pinFilterKind(pin: Gta6MapPin): Exclude<Gta6MapFilter, "all"> {
  const t = pin.type.toLowerCase();
  if (t.includes("landmark")) return "landmark";
  if (t.includes("city") || t === "town") return "city";
  return "region";
}

/**
 * Pins calibrated to region / landmark labels on leonida-map.jpg (2112×2707).
 * Only Rockstar-public names — positions follow this labeled basemap, not in-game GPS.
 */
export const GTA6_MAP_PINS: Gta6MapPin[] = [
  {
    id: "mount-kalaga",
    name: "Mount Kalaga National Park",
    type: "National park",
    region: "Mount Kalaga",
    summary:
      "Northern highlands / park area named on Rockstar’s VI locations list. Ultimate Edition copy also references Dominator Buggy for Mount Kalaga backwoods.",
    x: 50,
    y: 14,
    zoom: 0.9,
  },
  {
    id: "ambrosia",
    name: "Ambrosia",
    type: "Town",
    region: "Ambrosia",
    summary:
      "Official inland Leonida location from Rockstar’s Trailer 2–era site updates — rural / industrial scenery around the north-central state.",
    x: 47,
    y: 31,
    zoom: 1,
  },
  {
    id: "port-gellhorn",
    name: "Port Gellhorn",
    type: "City / port town",
    region: "Port Gellhorn",
    summary:
      "Western coastal city / port town listed on Rockstar’s official Leonida locations — industrial waterfront character in Trailer 2 location sets.",
    x: 30,
    y: 43,
    zoom: 1.1,
  },
  {
    id: "vice-city",
    name: "Vice City",
    type: "City",
    region: "Vice City",
    summary:
      "Main city of Leonida — modern Vice City, USA. Beaches, nightlife, skyline, and the Jason & Lucia story hub across trailers and official screenshots.",
    x: 70,
    y: 49,
    zoom: 1.2,
  },
  {
    id: "shore-drive",
    name: "Shore Drive",
    type: "Landmark",
    region: "Vice City",
    summary:
      "Named in Ultimate Edition ’95 Grotti Cheetah marketing as a Vice City street. Pin sits on the eastern Vice City coastal strip of this basemap.",
    x: 76,
    y: 45,
    zoom: 1.5,
  },
  {
    id: "washington-beach",
    name: "Washington Beach",
    type: "Landmark",
    region: "Vice City",
    summary:
      "Named in Ultimate Edition store copy (Shitzu Squalo docked at Washington Beach). Placed on the south-east Vice City beachfront of this basemap.",
    x: 77,
    y: 54,
    zoom: 1.5,
  },
  {
    id: "vercetti-estate",
    name: "Vercetti Estate",
    type: "Landmark",
    region: "Vice City",
    summary:
      "Named in Ultimate Edition revolver copy — classic Vice City estate styling. Approximate pin in the denser eastern Vice City grid on this basemap.",
    x: 71,
    y: 43,
    zoom: 1.5,
  },
  {
    id: "grassrivers",
    name: "Grassrivers",
    type: "Wetlands region",
    region: "Grassrivers",
    summary:
      "Official wetlands / river country south of the mainland cities — confirmed on Rockstar’s VI locations list with dedicated screenshots.",
    x: 40,
    y: 67,
    zoom: 1,
  },
  {
    id: "watson-bay",
    name: "Watson Bay / Paradise Garage",
    type: "Landmark",
    region: "Leonida Keys area",
    summary:
      "Ultimate Edition copy names Paradise Garage in Watson Bay (weapon locker / fencing). Pin near the southern bay approach labeled on this community basemap.",
    x: 60,
    y: 73,
    zoom: 1.3,
  },
  {
    id: "gambit-bay",
    name: "Gambit Bay",
    type: "Landmark",
    region: "Open water",
    summary:
      "Named in Ultimate Edition copy for open-ocean fishing / Squalo activity. Approximate offshore pin south-east of the mainland on this basemap.",
    x: 80,
    y: 70,
    zoom: 1.2,
  },
  {
    id: "leonida-keys",
    name: "Leonida Keys",
    type: "Region",
    region: "Leonida Keys",
    summary:
      "Tropical keys / island chain south of the mainland — officially listed on Rockstar’s VI location set with dedicated screenshots.",
    x: 57,
    y: 85,
    zoom: 1.1,
  },
];

export const GTA6_MAP = {
  title: "Map and cities — Leonida",
  lead:
    "Explore Leonida on the interactive map — pinch / scroll to zoom, drag to pan, and filter Cities / Regions / Landmarks. Only Rockstar-named places are pinned. Rockstar has not published official GPS or square-mileage figures.",
  state: {
    name: "Leonida",
    summary:
      "Fictional U.S. state inspired by Florida — neon city coastlines, keys, wetlands, industrial towns, and a national park. The single-player story of Jason and Lucia stretches across Leonida.",
  },
  citiesAndRegions: [
    {
      name: "Vice City",
      type: "City",
      summary:
        "Main city of the setting — modern Vice City, USA, with beaches, nightlife, skyline, and the conspiracy that pulls Jason and Lucia in. Featured heavily in trailers and official screenshots.",
    },
    {
      name: "Leonida Keys",
      type: "Region",
      summary:
        "Tropical keys / island chain south of the mainland vibe — officially listed on Rockstar’s VI location set with dedicated screenshots.",
    },
    {
      name: "Port Gellhorn",
      type: "City / port town",
      summary:
        "Named Leonida location on Rockstar’s official site — coastal / port character, shown in Trailer 2 era location lists.",
    },
    {
      name: "Grassrivers",
      type: "Wetlands region",
      summary:
        "Official Leonida region — swamp / river country outside the dense city, confirmed on Rockstar’s VI locations list.",
    },
    {
      name: "Ambrosia",
      type: "Town",
      summary:
        "Official Leonida location named by Rockstar alongside industrial / inland scenery in Trailer 2 website updates.",
    },
    {
      name: "Mount Kalaga National Park",
      type: "National park",
      summary:
        "Official park / highland area in Leonida. Also referenced in Ultimate Edition copy (e.g. Dominator Buggy for Mount Kalaga backwoods).",
    },
  ],
  landmarks: [
    {
      name: "Washington Beach",
      note: "Named in Ultimate Edition store copy (Shitzu Squalo docked at Washington Beach).",
    },
    {
      name: "Watson Bay / Paradise Garage",
      note: "Named in Ultimate Edition copy — Paradise Garage in Watson Bay with weapon locker / fencing spot.",
    },
    {
      name: "Gambit Bay",
      note: "Named in Ultimate Edition copy for open-ocean fishing / Squalo activity.",
    },
    {
      name: "Vercetti Estate",
      note: "Named in Ultimate Edition revolver copy — classic Vice City estate styling.",
    },
    {
      name: "Shore Drive",
      note: "Named in Ultimate Edition ’95 Grotti Cheetah marketing as a Vice City street reference.",
    },
  ],
  note: "Fan-made or leaked full maps are not official. This page only lists places Rockstar has named publicly.",
} as const;
