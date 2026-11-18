export type Gta6CheatRow =
  | { kind: "group"; label: string }
  | { kind: "cheat"; name: string; ps5: string; xbox: string; pc: string };

const PC = "No PC version";
const MISSING = "Not found yet";

function cheat(name: string, code = MISSING): Extract<Gta6CheatRow, { kind: "cheat" }> {
  return { kind: "cheat", name, ps5: code, xbox: code, pc: PC };
}

/**
 * Reported GTA 6 cheats from GamesRadar and PC Gamer, 18 November 2026.
 * D-pad sequences are the same on PS5 and Xbox. Missing buttons stay blank.
 * Not an official Rockstar list, and there is no PC version.
 */
export const GTA6_CHEAT_ROWS: Gta6CheatRow[] = [
  { kind: "group", label: "Player" },
  cheat("$250,000 — adds $250,000. Unlock: finish the story.", "UP, RIGHT, DOWN, LEFT, UP, LEFT, DOWN, RIGHT"),
  cheat("Drunk — you and your partner get drunk. Unlock: spend $2,500 on alcohol."),
  cheat("Raise Heat Level — raises heat on the map. Unlock: lose a 3-star wanted level 25 times.", "LEFT, DOWN, RIGHT, DOWN, UP, DOWN, UP"),
  cheat("Raise Wanted Level — raises your wanted level. Unlock: lose a 3-star wanted level 50 times.", "LEFT, DOWN, RIGHT, DOWN, UP, RIGHT, UP"),
  cheat("Unlimited Focus — Focus never runs out. Unlock: finish the story.", "DOWN, UP, UP, DOWN, UP, DOWN, UP, DOWN, UP, RIGHT"),
  cheat("No Fall Damage — no damage from falls. Unlock: survive a 40-foot freefall 20 times."),
  cheat("Parachute — adds a parachute. Unlock: 50 skydives or base jumps from 300 feet or higher."),
  cheat("Body Armor — adds body armor. Unlock: complete 100 workouts.", "DOWN, UP, LEFT, UP, UP, UP, UP, UP, DOWN, DOWN"),
  cheat("Repair Vehicle — fully repairs the vehicle you are in. Unlock: finish 1st in 10 races at Gellhorn Raceway, Thrillbilly Mud Club, and Boone Speedway."),
  cheat("Unlimited Nitrous — nitrous and fuel do not run out. Unlock: complete 50 stunt jumps."),

  { kind: "group", label: "Combat" },
  cheat("Max Ammo — fills every weapon. Unlock: 25 bronze medals or higher at shooting ranges.", "DOWN, UP, RIGHT, DOWN, LEFT, LEFT, UP, UP, DOWN, LEFT"),
  cheat("Infinite Ammo — ammo does not run out. Unlock: 25 silver medals or higher at shooting ranges.", "DOWN, UP, RIGHT, DOWN, LEFT, LEFT, UP, DOWN, DOWN, DOWN"),
  cheat("No Reload — ammo does not run out and you do not reload. Unlock: 25 gold medals at shooting ranges.", "DOWN, UP, RIGHT, DOWN, LEFT, LEFT, UP, DOWN, DOWN, UP"),
  cheat("All Explosive Weapons — adds every explosive weapon with full ammo. Unlock: throw 100 grenades."),
  cheat("Incendiary Ammo — ammo sets targets on fire. Unlock: burn 100 enemies with fire."),
  cheat("Exploding Bottles — bottles explode when damaged. Unlock: throw 100 molotovs."),
  cheat("Explosive Shotgun — a Mason & Keen Shortstraw that fires explosive shells. Unlock: hit 100 enemies with explosive damage."),
  cheat("Hauners H-AT — adds that weapon. Unlock: blow up 100 vehicles."),
  cheat("Attack Force — bullets and melee launch targets. Unlock: finish the story.", "DOWN, UP, LEFT, LEFT, RIGHT, DOWN, DOWN, UP, DOWN"),
  cheat("Exploding Balls — sports balls explode on impact. Unlock: hit 20 enemies with explosive damage.", "DOWN, UP, LEFT, LEFT, RIGHT, DOWN, DOWN, UP, RIGHT"),
  cheat("Vehicle Force — vehicle hits launch targets. Unlock: kill 25 people with a vehicle.", "DOWN, UP, LEFT, LEFT, RIGHT, DOWN, LEFT, UP, DOWN"),

  { kind: "group", label: "Environment" },
  cheat("Move Time Forward — moves the time of day forward. Unlock: find 10 collectible watches."),
  cheat("Pause Time of Day — freezes the current time. Unlock: find 20 collectible watches."),
  cheat("Cycle Weather — changes the weather. Unlock: reveal the whole map.", "DOWN, RIGHT, UP, DOWN, RIGHT, UP, RIGHT"),

  { kind: "group", label: "Vehicles" },
  cheat("Interstate Ambulance — spawns one. Unlock: discover it in the Progress menu."),
  cheat("Airboat 09 — spawns one. Unlock: complete 5 survival challenges."),
  cheat("Bravado Banshee — spawns one. Unlock: complete all combat challenges."),
  cheat("Tuff BMX — spawns one. Unlock: complete 5 fitness challenges."),
  cheat("Maibatsu Boomazoom — spawns one. Unlock: complete 5 shopping challenges.", "LEFT, UP, RIGHT, DOWN, LEFT, LEFT, UP, LEFT"),
  cheat("Nagasaki Carbon RS — spawns one. Unlock: complete all exploration challenges."),
  cheat("'65 Vapid Dominator — spawns one. Unlock: complete all fitness challenges."),
  cheat("Progen Emerus — spawns one. Unlock: complete all vehicle challenges."),
  cheat("Inflatable Flamingo — spawns one. Unlock: destroy 50 cocaine flamingos."),
  cheat("MTL Pumper — spawns one. Unlock: discover it in the Progress menu.", "LEFT, UP, RIGHT, DOWN, LEFT, RIGHT, RIGHT, UP"),
  cheat("Vapid Stainer G2 Taxi — spawns one. Unlock: complete 5 sports challenges."),
  cheat("Hauners P-996 Lazer — spawns one. Unlock: complete all challenges."),
  cheat("HVY Bulldozer — spawns one. Unlock: discover it in the Progress menu.", "LEFT, UP, RIGHT, DOWN, LEFT, RIGHT, RIGHT, DOWN"),
  cheat("Lapwing Mallard — spawns one. Unlock: complete 5 vehicle challenges."),
  cheat("Brimstone Golfer — spawns one. Unlock: complete all sports challenges."),
  cheat("Hauners Rhino Tank — spawns one. Unlock: complete all survival challenges."),
  cheat("Maibatsu Sanchez — spawns one. Unlock: complete 5 criminal challenges."),
  cheat("Nagasaki Sea Sparrow — spawns one. Unlock: complete 5 exploration challenges."),
  cheat("Speeder 700 GT — spawns one. Unlock: complete 5 combat challenges."),
  cheat("Truffade Thrax — spawns one. Unlock: complete all shopping challenges."),
  cheat("Western Zombie Bobber — spawns one. Unlock: complete all criminal challenges."),

  { kind: "group", label: "Screen filters" },
  cheat("Golden Hour — golden widescreen look. Unlock: spend 4 hours holding hands."),
  cheat("Powdered Sugar — white world with sparkles. Unlock: scan all space debris with WAiNK."),
  cheat("Pinhole — pinhole camera look. Unlock: clear 25 gang operations with your partner."),
  cheat("Neon Jungle — neon highlights. Unlock: discover all 16 Girlypop vehicles."),
  cheat("Yesteryear — black and white CRT look. Unlock: discover the Ridgway."),
  cheat("Cataclysm — murky smoke. Unlock: discover Martha's Vamos in the Progress menu.", "DOWN, DOWN, UP, RIGHT, RIGHT, UP, LEFT, LEFT, RIGHT, RIGHT"),
  cheat("Videotape — videotape look. Unlock: complete 50 activities with your partner."),
  cheat("Dark Mirror — upside down and black. Unlock: make $500,000 selling vehicles."),
  cheat("Migraine — blurred and distorted. Unlock: survive 6 minutes at a 6-star wanted level."),
  cheat("Dollhouse — vivid narrow look. Unlock: spend 8 hours with your partner.", "DOWN, DOWN, UP, RIGHT, RIGHT, UP, LEFT, LEFT, DOWN, RIGHT"),
  cheat("Bubblegum — purple and yellow with sparkles. Unlock: find all 24 Vice City Flamingos cards."),
  cheat("Fast Forward — motion blur and faster clouds. Unlock: complete 50 meditations."),
  cheat("Fisheye — fisheye look. Unlock: catch 100 fish."),
  cheat("Faded Glory — color CRT look. Unlock: rob 50 stores with your partner.", "DOWN, DOWN, UP, RIGHT, RIGHT, UP, LEFT, LEFT, LEFT, RIGHT"),
  cheat("Pixel Art — pixelated look. Unlock: make $250,000 selling collectibles."),
  cheat("Hellscape — red and orange heat haze. Unlock: steal 100 cop vehicles."),
];
