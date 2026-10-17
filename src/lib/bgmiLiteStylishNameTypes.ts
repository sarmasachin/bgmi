/** Shared types for BGMI Air stylish-name generator + studio. */

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
