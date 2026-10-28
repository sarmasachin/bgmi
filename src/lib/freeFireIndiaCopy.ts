/** On /free-fire-india only: "Free Fire" reads as "Free Fire India". Max copy stays Max. */
export function asFreeFireIndiaCopy(value: string): string {
  return value.replace(/Free Fire(?!\s+India)(?!\s+Max)/g, "Free Fire India");
}
