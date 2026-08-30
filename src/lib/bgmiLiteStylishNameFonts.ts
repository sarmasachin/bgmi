/**
 * Stylish-name public API — types, filters, and 5000-name generator.
 */

import type { StylishCategory } from "@/src/lib/bgmiLiteStylishNameTypes";

export type { StylishCategory, StylishVariant } from "@/src/lib/bgmiLiteStylishNameTypes";

export const LITE_NAME_SOFT_LIMIT = 14;

export const STYLISH_FILTERS: Array<{ id: StylishCategory | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "crown", label: "Crown" },
  { id: "wings", label: "Wings" },
  { id: "spaced", label: "Spaced" },
  { id: "fancy", label: "Fancy" },
  { id: "clan", label: "Clan" },
  { id: "marks", label: "Marks" },
];

export function stylishNameLength(value: string): number {
  return Array.from(value).length;
}

export {
  buildStylishVariants,
  STYLISH_NAME_TARGET,
} from "@/src/lib/bgmiLiteStylishNameGenerate";
