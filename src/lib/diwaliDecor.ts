/**
 * Diwali festival decorations — diyas on update boxes + calculators.
 * On/off is controlled in Admin → Website Settings (`integrations.showDiwaliDiyas`).
 * See `.cursor/rules/diwali-decor.mdc`
 */

/** Default when setting is missing (opt-in). */
export const DIWALI_DIYAS_DEFAULT = false;

export function isDiwaliDiyasEnabled(integrations: unknown): boolean {
  if (!integrations || typeof integrations !== "object") return DIWALI_DIYAS_DEFAULT;
  const obj = integrations as Record<string, unknown>;
  return obj.showDiwaliDiyas === true;
}
