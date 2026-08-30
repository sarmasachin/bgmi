import type { PlayerRole } from "@/src/features/sensCalculator/calculator";

/** CustomEvent name — Lite play-mode chips / tip CTAs set calculator play style. */
export const LITE_SET_PLAY_STYLE_EVENT = "lite-set-play-style";

export type LiteSetPlayStyleDetail = {
  playerRole: PlayerRole;
};

/** Map FF-shaped play-mode roles → Lite calculator PlayerRole. */
export function litePlayerRoleFromChipRole(
  role: string,
): PlayerRole {
  if (role === "rusher") return "assaulter";
  if (role === "sniper") return "sniper";
  return "balanced";
}
