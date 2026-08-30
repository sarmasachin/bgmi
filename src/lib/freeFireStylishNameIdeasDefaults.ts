/** Default ready-idea chips for Free Fire stylish name CMS. */

export type FreeFireStylishNameIdeaItem = {
  id: string;
  label: string;
  value: string;
};

export type FreeFireStylishNameIdeaGroup = {
  tab: string;
  items: FreeFireStylishNameIdeaItem[];
};

export const DEFAULT_FREE_FIRE_STYLISH_IDEA_GROUPS: FreeFireStylishNameIdeaGroup[] = [
  {
    tab: "Clean",
    items: [
      { id: "ff-c1", label: "Nova", value: "★Nova★" },
      { id: "ff-c2", label: "Pulse", value: "Pulse丨FF" },
      { id: "ff-c3", label: "Apex", value: "【Apex】" },
      { id: "ff-c4", label: "Drift", value: "Drift✦" },
      { id: "ff-c5", label: "Orbit", value: "Orbit⚡" },
      { id: "ff-c6", label: "Blade", value: "Blade⚔" },
    ],
  },
  {
    tab: "Pro",
    items: [
      { id: "ff-p1", label: "Raven", value: "RAV丨EN" },
      { id: "ff-p2", label: "Ghost", value: "GHOST★" },
      { id: "ff-p3", label: "Viper", value: "【VIPER】" },
      { id: "ff-p4", label: "Storm", value: "STORM彡" },
      { id: "ff-p5", label: "Ace", value: "♛ACE" },
      { id: "ff-p6", label: "Flux", value: "FLUX丨99" },
    ],
  },
  {
    tab: "Attitude",
    items: [
      { id: "ff-a1", label: "Savage", value: "★Savage" },
      { id: "ff-a2", label: "Rebel", value: "Rebel乂" },
      { id: "ff-a3", label: "Fearless", value: "Fearless" },
      { id: "ff-a4", label: "Hunt", value: "HUNT༒" },
      { id: "ff-a5", label: "Rage", value: "Rage⚡" },
      { id: "ff-a6", label: "King", value: "♛King" },
    ],
  },
];

export function cloneFreeFireStylishIdeaGroups(
  groups: FreeFireStylishNameIdeaGroup[] = DEFAULT_FREE_FIRE_STYLISH_IDEA_GROUPS,
): FreeFireStylishNameIdeaGroup[] {
  return groups.map((g) => ({
    tab: g.tab,
    items: g.items.map((item) => ({ ...item })),
  }));
}
