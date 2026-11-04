export type Gta6CheatRow =
  | { kind: "group"; label: string }
  | {
      kind: "cheat";
      name: string;
      /** Dummy past-game inputs — not confirmed for GTA 6. */
      ps5: string;
      xbox: string;
      pc: string;
    };

function cheat(
  name: string,
  ps5: string,
  xbox: string,
  pc: string,
): Extract<Gta6CheatRow, { kind: "cheat" }> {
  return { kind: "cheat", name, ps5, xbox, pc };
}

/** Dummy GTA V / SA codes for PS5, Xbox, and PC. */
export const GTA6_CHEAT_ROWS: Gta6CheatRow[] = [
  { kind: "group", label: "Weapons and health" },
  cheat(
    "Give weapons",
    "TRIANGLE, R2, LEFT, L1, X, RIGHT, TRIANGLE, DOWN, SQUARE, L1, L1, L1",
    "Y, RT, LEFT, LB, A, RIGHT, Y, DOWN, X, LB, LB, LB",
    "TOOLUP",
  ),
  cheat(
    "Weapon set 2",
    "R1, R2, L1, R2, LEFT, DOWN, RIGHT, UP, LEFT, DOWN, DOWN, LEFT",
    "RB, RT, LB, RT, LEFT, DOWN, RIGHT, UP, LEFT, DOWN, DOWN, LEFT",
    "PROFESSIONALSKIT",
  ),
  cheat(
    "Weapon set 3",
    "R1, R2, L1, R2, LEFT, DOWN, RIGHT, UP, LEFT, DOWN, DOWN, DOWN",
    "RB, RT, LB, RT, LEFT, DOWN, RIGHT, UP, LEFT, DOWN, DOWN, DOWN",
    "UZUMYMW",
  ),
  cheat(
    "Health",
    "R1, R2, L1, CIRCLE, LEFT, DOWN, RIGHT, UP, LEFT, DOWN, RIGHT, UP",
    "RB, RT, LB, B, LEFT, DOWN, RIGHT, UP, LEFT, DOWN, RIGHT, UP",
    "ASPIRINE",
  ),
  cheat(
    "Armor",
    "R1, R2, L1, X, LEFT, DOWN, RIGHT, UP, LEFT, DOWN, RIGHT, UP",
    "RB, RT, LB, A, LEFT, DOWN, RIGHT, UP, LEFT, DOWN, RIGHT, UP",
    "PRECIOUSPROTECTION",
  ),
  cheat(
    "Max health and armor",
    "CIRCLE, L1, TRIANGLE, R2, X, SQUARE, CIRCLE, RIGHT, SQUARE, L1, L1, L1",
    "B, LB, Y, RT, A, X, B, RIGHT, X, LB, LB, LB",
    "TURTLE",
  ),
  cheat(
    "Invincible for 5 minutes",
    "RIGHT, X, RIGHT, LEFT, RIGHT, R1, RIGHT, LEFT, X, TRIANGLE",
    "RIGHT, A, RIGHT, LEFT, RIGHT, RB, RIGHT, LEFT, A, Y",
    "PAINKILLER",
  ),
  cheat(
    "Special ability recharged",
    "X, X, SQUARE, R1, L1, X, RIGHT, LEFT, X",
    "A, A, X, RB, LB, A, RIGHT, LEFT, A",
    "POWERUP",
  ),
  cheat(
    "Explosive ammo",
    "RIGHT, SQUARE, X, LEFT, R1, R2, LEFT, RIGHT, RIGHT, L1, L1, L1",
    "RIGHT, X, A, LEFT, RB, RT, LEFT, RIGHT, RIGHT, LB, LB, LB",
    "HIGHEX",
  ),
  cheat(
    "Flaming bullets",
    "L1, R1, SQUARE, R1, LEFT, R2, R1, LEFT, SQUARE, RIGHT, L1, L1",
    "LB, RB, X, RB, LEFT, RT, RB, LEFT, X, RIGHT, LB, LB",
    "INCENDIARY",
  ),
  cheat(
    "Explosive melee attacks",
    "RIGHT, LEFT, X, TRIANGLE, R1, CIRCLE, CIRCLE, CIRCLE, L2",
    "RIGHT, LEFT, A, Y, RB, B, B, B, LT",
    "HOTHANDS",
  ),
  cheat(
    "Infinite ammo",
    "L1, R1, SQUARE, R1, LEFT, R2, R1, LEFT, SQUARE, DOWN, L1, L1",
    "LB, RB, X, RB, LEFT, RT, RB, LEFT, X, DOWN, LB, LB",
    "FULLCLIP",
  ),
  cheat(
    "Money",
    "R1, R2, L1, X, LEFT, DOWN, RIGHT, UP, LEFT, DOWN, RIGHT, UP",
    "RB, RT, LB, A, LEFT, DOWN, RIGHT, UP, LEFT, DOWN, RIGHT, UP",
    "HESOYAM",
  ),
  { kind: "group", label: "Police" },
  cheat(
    "Wanted level up",
    "R1, R1, CIRCLE, R2, LEFT, RIGHT, LEFT, RIGHT, LEFT, RIGHT",
    "RB, RB, B, RT, LEFT, RIGHT, LEFT, RIGHT, LEFT, RIGHT",
    "FUGITIVE",
  ),
  cheat(
    "Wanted level down",
    "R1, R1, CIRCLE, R2, RIGHT, LEFT, RIGHT, LEFT, RIGHT, LEFT",
    "RB, RB, B, RT, RIGHT, LEFT, RIGHT, LEFT, RIGHT, LEFT",
    "LAWYERUP",
  ),
  cheat(
    "Clear wanted level",
    "R1, R2, L1, R1, LEFT, RIGHT, LEFT, RIGHT, LEFT, RIGHT",
    "RB, RT, LB, RB, LEFT, RIGHT, LEFT, RIGHT, LEFT, RIGHT",
    "AEZAKMI",
  ),
  { kind: "group", label: "Movement" },
  cheat(
    "Fast run",
    "TRIANGLE, LEFT, RIGHT, RIGHT, L2, L1, SQUARE",
    "Y, LEFT, RIGHT, RIGHT, LT, LB, X",
    "CATCHME",
  ),
  cheat(
    "Fast swim",
    "LEFT, LEFT, L1, RIGHT, RIGHT, R2, LEFT, L2, RIGHT",
    "LEFT, LEFT, LB, RIGHT, RIGHT, RT, LEFT, LT, RIGHT",
    "GOTGILLS",
  ),
  cheat(
    "Super jump",
    "LEFT, LEFT, TRIANGLE, TRIANGLE, RIGHT, RIGHT, LEFT, RIGHT, SQUARE, R1, R2",
    "LEFT, LEFT, Y, Y, RIGHT, RIGHT, LEFT, RIGHT, X, RB, RT",
    "HOPTOIT",
  ),
  cheat(
    "Parachute",
    "LEFT, RIGHT, L1, L2, R1, R2, R2, LEFT, LEFT, RIGHT, L1",
    "LEFT, RIGHT, LB, LT, RB, RT, RT, LEFT, LEFT, RIGHT, LB",
    "SKYDIVE",
  ),
  cheat(
    "Moon gravity",
    "LEFT, LEFT, L1, R1, L1, RIGHT, LEFT, L1, LEFT",
    "LEFT, LEFT, LB, RB, LB, RIGHT, LEFT, LB, LEFT",
    "FLOATER",
  ),
  cheat(
    "Slow motion",
    "TRIANGLE, LEFT, RIGHT, RIGHT, SQUARE, R2, R1",
    "Y, LEFT, RIGHT, RIGHT, X, RT, RB",
    "SLOWMO",
  ),
  cheat(
    "Slow motion aim",
    "SQUARE, L2, R1, TRIANGLE, LEFT, SQUARE, L2, RIGHT, X",
    "X, LT, RB, Y, LEFT, X, LT, RIGHT, A",
    "DEADEYE",
  ),
  cheat(
    "Skyfall",
    "L1, L2, R1, R2, LEFT, RIGHT, LEFT, RIGHT, L1, L2, R1, R2, LEFT, RIGHT, LEFT, RIGHT",
    "LB, LT, RB, RT, LEFT, RIGHT, LEFT, RIGHT, LB, LT, RB, RT, LEFT, RIGHT, LEFT, RIGHT",
    "SKYFALL",
  ),
  cheat(
    "Drunk mode",
    "TRIANGLE, RIGHT, RIGHT, LEFT, RIGHT, SQUARE, CIRCLE, LEFT",
    "Y, RIGHT, RIGHT, LEFT, RIGHT, X, B, LEFT",
    "LIQUOR",
  ),
  { kind: "group", label: "Vehicles" },
  cheat(
    "Spawn Buzzard",
    "CIRCLE, CIRCLE, L1, CIRCLE, CIRCLE, CIRCLE, L1, L2, R1, TRIANGLE, CIRCLE, TRIANGLE",
    "B, B, LB, B, B, B, LB, LT, RB, Y, B, Y",
    "BUZZOFF",
  ),
  cheat(
    "Spawn BMX",
    "LEFT, LEFT, RIGHT, RIGHT, LEFT, RIGHT, SQUARE, CIRCLE, TRIANGLE, R1, R2",
    "LEFT, LEFT, RIGHT, RIGHT, LEFT, RIGHT, X, B, Y, RB, RT",
    "BANDIT",
  ),
  cheat(
    "Spawn Caddy",
    "CIRCLE, L1, LEFT, R1, L2, X, R1, L1, CIRCLE, X",
    "B, LB, LEFT, RB, LT, A, RB, LB, B, A",
    "HOLEIN1",
  ),
  cheat(
    "Spawn Comet",
    "R1, CIRCLE, R2, RIGHT, L1, L2, X, X, SQUARE, R1",
    "RB, B, RT, RIGHT, LB, LT, A, A, X, RB",
    "COMET",
  ),
  cheat(
    "Spawn Duster",
    "RIGHT, LEFT, R1, R1, R1, LEFT, TRIANGLE, TRIANGLE, X, CIRCLE, L1, L1",
    "RIGHT, LEFT, RB, RB, RB, LEFT, Y, Y, A, B, LB, LB",
    "FLYSPRAY",
  ),
  cheat(
    "Spawn PCJ-600",
    "R1, RIGHT, LEFT, RIGHT, R2, LEFT, RIGHT, SQUARE, RIGHT, L2, L1, L1",
    "RB, RIGHT, LEFT, RIGHT, RT, LEFT, RIGHT, X, RIGHT, LT, LB, LB",
    "ROCKET",
  ),
  cheat(
    "Spawn Rapid GT",
    "R2, L1, CIRCLE, RIGHT, L1, R1, RIGHT, LEFT, CIRCLE, R2",
    "RT, LB, B, RIGHT, LB, RB, RIGHT, LEFT, B, RT",
    "RAPIDGT",
  ),
  cheat(
    "Spawn Sanchez",
    "CIRCLE, X, L1, CIRCLE, CIRCLE, L1, CIRCLE, R1, R2, L2, L1, L1",
    "B, A, LB, B, B, LB, B, RB, RT, LT, LB, LB",
    "OFFROAD",
  ),
  cheat(
    "Spawn Stretch limo",
    "R2, RIGHT, L2, LEFT, LEFT, R1, L1, CIRCLE, RIGHT",
    "RT, RIGHT, LT, LEFT, LEFT, RB, LB, B, RIGHT",
    "VINEWOOD",
  ),
  cheat(
    "Spawn stunt plane",
    "CIRCLE, RIGHT, L1, L2, LEFT, R1, L1, L1, LEFT, LEFT, X, TRIANGLE",
    "B, RIGHT, LB, LT, LEFT, RB, LB, LB, LEFT, LEFT, A, Y",
    "BARNSTORM",
  ),
  cheat(
    "Spawn Trashmaster",
    "CIRCLE, R1, CIRCLE, R1, LEFT, LEFT, R1, L1, CIRCLE, RIGHT",
    "B, RB, B, RB, LEFT, LEFT, RB, LB, B, RIGHT",
    "TRASHED",
  ),
  cheat(
    "Spawn Dodo sea plane",
    "R1, CIRCLE, R2, RIGHT, RIGHT, TRIANGLE, L1, CIRCLE, RIGHT",
    "RB, B, RT, RIGHT, RIGHT, Y, LB, B, RIGHT",
    "EXTINCT",
  ),
  cheat(
    "Spawn Duke O'Death",
    "CIRCLE, X, CIRCLE, X, L1, L2, L1, L1, LEFT, LEFT, CIRCLE, RIGHT",
    "B, A, B, A, LB, LT, LB, LB, LEFT, LEFT, B, RIGHT",
    "DEATHCAR",
  ),
  cheat(
    "Spawn Kraken",
    "RIGHT, LEFT, RIGHT, LEFT, L1, LEFT, CIRCLE, R1, LEFT",
    "RIGHT, LEFT, RIGHT, LEFT, LB, LEFT, B, RB, LEFT",
    "BUBBLES",
  ),
  cheat(
    "Spawn Rhino tank",
    "CIRCLE, CIRCLE, CIRCLE, CIRCLE, CIRCLE, CIRCLE, R1, L2, L1, TRIANGLE, CIRCLE, TRIANGLE",
    "B, B, B, B, B, B, RB, LT, LB, Y, B, Y",
    "AIWPRTON",
  ),
  cheat(
    "Spawn Hunter",
    "CIRCLE, X, L1, CIRCLE, CIRCLE, L1, CIRCLE, R1, R2, L2, L1, L1",
    "B, A, LB, B, B, LB, B, RB, RT, LT, LB, LB",
    "OHDUDE",
  ),
  cheat("Spawn Hydra", "JUMPJET", "JUMPJET", "JUMPJET"),
  cheat(
    "Spawn jetpack",
    "CIRCLE, CIRCLE, CIRCLE, CIRCLE, CIRCLE, CIRCLE, R1, TRIANGLE, TRIANGLE, TRIANGLE, TRIANGLE, TRIANGLE, TRIANGLE",
    "B, B, B, B, B, B, RB, Y, Y, Y, Y, Y, Y",
    "ROCKETMAN",
  ),
  { kind: "group", label: "Street and world" },
  cheat(
    "Slidey cars",
    "TRIANGLE, R1, R1, LEFT, R1, L1, R2, L1",
    "Y, RB, RB, LEFT, RB, LB, RT, LB",
    "SNOWDAY",
  ),
  cheat(
    "Flying cars",
    "SQUARE, DOWN, L2, UP, L1, CIRCLE, UP, X, LEFT",
    "X, DOWN, LT, UP, LB, B, UP, A, LEFT",
    "CHITTYCHITTYBANGBANG",
  ),
  cheat(
    "Perfect vehicle handling",
    "TRIANGLE, LEFT, R1, R1, LEFT, RIGHT, R1, L1, L2, L1",
    "Y, LEFT, RB, RB, LEFT, RIGHT, RB, LB, LT, LB",
    "STICKLIKEGLUE",
  ),
  cheat(
    "Change weather",
    "R2, X, L1, L1, L2, L2, L2, SQUARE",
    "RT, A, LB, LB, LT, LT, LT, X",
    "MAKEITRAIN",
  ),
  cheat(
    "Pedestrian riot",
    "L2, RIGHT, L1, TRIANGLE, RIGHT, RIGHT, R1, L1, RIGHT, L1, L1, L1",
    "LT, RIGHT, LB, Y, RIGHT, RIGHT, RB, LB, RIGHT, LB, LB, LB",
    "STATEOFEMERGENCY",
  ),
  cheat(
    "Pedestrians attack you",
    "DOWN, UP, UP, UP, X, R2, R1, L2, L2",
    "DOWN, UP, UP, UP, A, RT, RB, LT, LT",
    "NOBODYLIKESME",
  ),
  cheat(
    "Pedestrians have weapons",
    "R1, R2, X, TRIANGLE, X, TRIANGLE, UP, DOWN",
    "RB, RT, A, Y, A, Y, UP, DOWN",
    "NINJATOWN",
  ),
  cheat(
    "Aggressive traffic",
    "R2, CIRCLE, R1, L2, LEFT, R1, L1, R2, L2",
    "RT, B, RB, LT, LEFT, RB, LB, RT, LT",
    "YLTEICZ",
  ),
  { kind: "group", label: "Phone and character" },
  cheat("Enter director mode", "1-999-846-2677", "1-999-846-2677", "JRTALENT"),
  cheat("Black cellphones", "1-999-826-826", "1-999-826-826", "1-999-826-826"),
  cheat(
    "Change player model",
    "RIGHT, DOWN, LEFT, UP, L1, L2, L1, L1, L2, L1, L1, L1",
    "RIGHT, DOWN, LEFT, UP, LB, LT, LB, LB, LT, LB, LB, LB",
    "BESTOWEDLEADER",
  ),
];
