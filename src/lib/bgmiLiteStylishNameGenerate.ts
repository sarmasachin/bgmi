/**
 * Mass generator: up to 5000 unique stylish names from typed text.
 * Mixes fonts × photo symbols × wrap designs. Hidden from UI picker.
 */

import {
  MAP_BOLD,
  MAP_DOUBLE,
  MAP_ITALIC,
  MAP_LEET,
  MAP_SCRIPT,
  MAP_SMALL,
  mapLetters,
  spaceLetters,
} from "@/src/lib/bgmiLiteStylishNameMaps";
import {
  FRAME_PAIRS,
  GUN_ARTS,
  NAME_TEMPLATES,
  PREFIXES,
  SEPARATORS,
  SIDE_MARKS_SAFE,
  SUFFIXES,
  fillTemplate,
  wrapFrame,
  wrapFrameSpaced,
  wrapSides,
} from "@/src/lib/bgmiLiteStylishNameSymbols";
import type { StylishCategory, StylishVariant } from "@/src/lib/bgmiLiteStylishNameTypes";

export const STYLISH_NAME_TARGET = 5000;

const CAT_LABEL: Record<StylishCategory, string> = {
  crown: "Crown",
  wings: "Wings",
  spaced: "Spaced",
  fancy: "Fancy",
  clan: "Clan",
  marks: "Marks",
};

type Core = { id: string; text: string; cat: StylishCategory };

function nameLen(value: string): number {
  return Array.from(value).length;
}

function buildCores(tight: string): Core[] {
  const spaced = spaceLetters(tight);
  const upper = tight.toUpperCase();
  return [
    { id: "n", text: tight, cat: "marks" },
    { id: "u", text: upper, cat: "crown" },
    { id: "s", text: spaced, cat: "spaced" },
    { id: "l", text: mapLetters(tight, MAP_LEET) || tight, cat: "fancy" },
    { id: "b", text: mapLetters(tight, MAP_BOLD) || tight, cat: "fancy" },
    { id: "i", text: mapLetters(tight, MAP_ITALIC) || tight, cat: "fancy" },
    { id: "c", text: mapLetters(tight, MAP_SCRIPT) || tight, cat: "fancy" },
    { id: "m", text: mapLetters(tight.toLowerCase(), MAP_SMALL) || tight, cat: "fancy" },
    { id: "d", text: mapLetters(tight, MAP_DOUBLE) || tight, cat: "fancy" },
  ];
}

function wrapCat(core: Core, fallback: StylishCategory): StylishCategory {
  if (core.cat === "fancy" || core.cat === "spaced") return core.cat;
  return fallback;
}

/** Generate up to 5000 unique gallery-style names for one base nickname. */
export function buildStylishVariants(base: string): StylishVariant[] {
  const raw = base.trim();
  if (!raw) return [];

  const tight = raw.replace(/\s+/g, "");
  const cores = buildCores(tight);
  const parts = {
    n: tight,
    u: tight.toUpperCase(),
    s: spaceLetters(tight),
    l: mapLetters(tight, MAP_LEET) || tight,
    b: mapLetters(tight, MAP_BOLD) || tight,
  };
  const tag = parts.u.slice(0, Math.min(3, parts.u.length));
  const rest = tight.slice(tag.length) || tight;

  const seen = new Set<string>();
  const out: StylishVariant[] = [];

  const push = (category: StylishCategory, value: string): boolean => {
    if (out.length >= STYLISH_NAME_TARGET) return false;
    const v = value.trim();
    if (!v || seen.has(v)) return true;
    seen.add(v);
    const n = out.length + 1;
    out.push({
      id: `n-${n}`,
      category,
      label: CAT_LABEL[category],
      hint: `#${n}`,
      value: v,
      length: nameLen(v),
    });
    return out.length < STYLISH_NAME_TARGET;
  };

  for (const t of NAME_TEMPLATES) {
    if (!push(t.category, fillTemplate(t.pattern, parts))) return out;
  }

  for (const core of cores) {
    if (!push(core.cat, core.text)) return out;
  }

  for (const core of cores) {
    for (const mark of SIDE_MARKS_SAFE) {
      if (!push(wrapCat(core, "crown"), wrapSides(core.text, mark))) return out;
    }
  }

  for (const core of cores) {
    for (const [L, R] of FRAME_PAIRS) {
      if (!push(wrapCat(core, "wings"), wrapFrame(core.text, L, R))) return out;
      if (!push(wrapCat(core, "wings"), wrapFrameSpaced(core.text, L, R))) return out;
    }
  }

  for (const core of cores) {
    for (const pref of PREFIXES) {
      if (!push(wrapCat(core, "clan"), `${pref}${core.text}`)) return out;
    }
  }

  for (const core of cores) {
    for (const suf of SUFFIXES) {
      if (!push(wrapCat(core, "marks"), `${core.text}${suf}`)) return out;
    }
  }

  for (const core of cores) {
    for (const gun of GUN_ARTS) {
      if (!push("clan", `${gun}${core.text}`)) return out;
      if (!push("clan", `${core.text}${gun}`)) return out;
    }
  }

  for (const sep of SEPARATORS) {
    if (!push("clan", `${tag}${sep}${rest}`)) return out;
  }

  for (const core of cores) {
    for (let a = 0; a < SIDE_MARKS_SAFE.length; a++) {
      for (let b = 0; b < SIDE_MARKS_SAFE.length; b++) {
        if (a === b) continue;
        const L = SIDE_MARKS_SAFE[a]!;
        const R = SIDE_MARKS_SAFE[b]!;
        if (!push(wrapCat(core, "marks"), `${L}${core.text}${R}`)) return out;
      }
    }
  }

  for (const core of cores) {
    for (const pref of PREFIXES) {
      for (const [L, R] of FRAME_PAIRS) {
        for (const suf of SUFFIXES) {
          if (!push("clan", `${pref}${L}${core.text}${R}${suf}`)) return out;
          if (!push(wrapCat(core, "wings"), `${L}${pref}${core.text}${suf}${R}`)) return out;
        }
      }
    }
  }

  return out;
}
