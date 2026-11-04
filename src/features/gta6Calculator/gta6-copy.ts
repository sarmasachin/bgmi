import type { Gta6Console, Gta6Numbers, PlatformId } from "@/src/features/gta6Calculator/gta6-presets";

const PLATFORM: Record<PlatformId, string> = {
  ps5: "PS5",
  xbox: "Xbox Series X|S",
};

const LEVEL: Record<Gta6Console["haptic"], string> = {
  off: "Off",
  low: "Low",
  high: "High",
};

export function gta6CopyText(input: {
  platform: PlatformId;
  preset: string;
  numbers: Gta6Numbers;
  console: Gta6Console;
}): string {
  const { numbers: n, console: c } = input;
  return [
    "GTA 6 sensitivity — fan starting point, not an official Rockstar setting",
    `Platform: ${PLATFORM[input.platform]}`,
    `Preset: ${input.preset}`,
    "Targeting: Free aim (check at launch)",
    `Haptic feedback: ${LEVEL[c.haptic]}`,
    `Adaptive triggers: ${LEVEL[c.triggers]}`,
    `Invert look: ${c.invert === "on" ? "On" : "Off"}`,
    `Control type: ${c.controlType === "fps" ? "FPS" : c.controlType === "southpaw" ? "Southpaw" : "Standard"}`,
    `Movement while zoomed: ${c.zoomMove === "on" ? "On" : "Off"}`,
    `Drive-by: ${c.driveBy === "aim-fire" ? "Aim + Fire" : "Aim"}`,
    `Controller speaker: ${c.speaker === "on" ? "On" : "Off"}`,
    "Sprint: L3 click (check at launch)",
    `Third-person aim: ${n.aim3}%`,
    `First-person look: ${n.look1}%`,
    `First-person aim: ${n.aim1}%`,
    `Third-person look: ${n.look3}%`,
    `Third-person deadzone: ${n.deadzone3}%`,
    `First-person deadzone: ${n.deadzone1}%`,
    `Third-person acceleration: ${n.accel3}%`,
    `First-person acceleration: ${n.accel1}%`,
  ].join("\n");
}

/** Clipboard first, then a selected textarea. Returns false only when both are blocked. */
export async function copyPlainText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* permission or missing user gesture */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.left = "0";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.focus();
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}
