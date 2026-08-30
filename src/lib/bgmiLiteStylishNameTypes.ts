/** Shared types for BGMI Lite stylish-name generator + studio. */

export type StylishCategory =
  | "crown"
  | "wings"
  | "spaced"
  | "fancy"
  | "clan"
  | "marks";

export type StylishVariant = {
  id: string;
  category: StylishCategory;
  label: string;
  hint: string;
  value: string;
  length: number;
};
