/**
 * BGMI stylish-name symbol lib — merges photo gallery catalog + helpers.
 * Hidden from UI; used only when generating names from typed text.
 */

import {
  PHOTO_FRAME_PAIRS,
  PHOTO_GUN_ARTS,
  PHOTO_NAME_TEMPLATES,
  PHOTO_PREFIXES,
  PHOTO_SEPARATORS,
  PHOTO_SIDE_MARKS,
  PHOTO_SUFFIXES,
} from "@/src/lib/bgmiLiteStylishNameGalleryCatalog";

export function stylishSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickFromPool<T>(pool: readonly T[], seed: number, salt = 0): T {
  const i = (seed + salt * 2654435761) >>> 0;
  return pool[i % pool.length]!;
}

function uniqStrings(items: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of items) {
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

/** All side marks from photos (+ safe extras). */
export const SIDE_MARKS_SAFE = uniqStrings([
  ...PHOTO_SIDE_MARKS,
  "♛︎", "☆︎", "✧︎", "⚔️", "ॐ",
]) as readonly string[];

export const FRAME_PAIRS: ReadonlyArray<readonly [string, string]> = (() => {
  const seen = new Set<string>();
  const out: Array<readonly [string, string]> = [];
  for (const pair of PHOTO_FRAME_PAIRS) {
    const key = `${pair[0]}||${pair[1]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(pair);
  }
  return out;
})();

export const PREFIXES = uniqStrings([...PHOTO_PREFIXES, ...PHOTO_GUN_ARTS]) as readonly string[];
export const SUFFIXES = uniqStrings([...PHOTO_SUFFIXES]) as readonly string[];
export const SEPARATORS = uniqStrings([...PHOTO_SEPARATORS]) as readonly string[];
export const GUN_ARTS = uniqStrings([...PHOTO_GUN_ARTS]) as readonly string[];

export const NAME_TEMPLATES = PHOTO_NAME_TEMPLATES;

export function wrapSides(core: string, mark: string): string {
  return `${mark}${core}${mark}`;
}

export function wrapFrame(core: string, L: string, R: string): string {
  return `${L}${core}${R}`;
}

export function wrapFrameSpaced(core: string, L: string, R: string): string {
  return `${L} ${core} ${R}`;
}

export function fillTemplate(
  pattern: string,
  parts: { n: string; u: string; s: string; l: string; b: string },
): string {
  return pattern
    .replaceAll("{n}", parts.n)
    .replaceAll("{u}", parts.u)
    .replaceAll("{s}", parts.s)
    .replaceAll("{l}", parts.l)
    .replaceAll("{b}", parts.b);
}

/** Total unique photo symbols available to the generator. */
export function countGallerySymbols(): number {
  return (
    SIDE_MARKS_SAFE.length +
    FRAME_PAIRS.length * 2 +
    PREFIXES.length +
    SUFFIXES.length +
    SEPARATORS.length +
    GUN_ARTS.length
  );
}
