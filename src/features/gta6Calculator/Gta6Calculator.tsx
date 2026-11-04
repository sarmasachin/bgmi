"use client";

import { useEffect, useState } from "react";
import { DiwaliCardDiyas, withDiwaliClass } from "@/src/components/DiwaliCardDiyas";
import { Gta6ConsoleFields } from "@/src/features/gta6Calculator/Gta6ConsoleFields";
import { Gta6SensFields } from "@/src/features/gta6Calculator/Gta6SensFields";
import { copyPlainText, gta6CopyText } from "@/src/features/gta6Calculator/gta6-copy";
import {
  applyGta6Preset,
  GTA6_PRESETS,
  type Gta6Console,
  type Gta6Numbers,
  type PlatformId,
  type PresetId,
} from "@/src/features/gta6Calculator/gta6-presets";

const DEFAULT_CONSOLE: Gta6Console = {
  haptic: "low",
  triggers: "low",
  speaker: "on",
  sprint: "l3",
  targeting: "free",
  zoomMove: "on",
  driveBy: "aim-fire",
  invert: "off",
  controlType: "standard",
};

export function Gta6Calculator() {
  const [platform, setPlatform] = useState<PlatformId>("ps5");
  const [presetId, setPresetId] = useState<PresetId>("explore");
  const [thirdLook, setThirdLook] = useState("");
  const [drift, setDrift] = useState("");
  const [numbers, setNumbers] = useState<Gta6Numbers>(() => applyGta6Preset("explore", "", ""));
  const [consoleOpts, setConsoleOpts] = useState<Gta6Console>(DEFAULT_CONSOLE);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNumbers(applyGta6Preset(presetId, thirdLook, drift));
    setCopied(false);
  }, [presetId, thirdLook, drift]);

  const preset = GTA6_PRESETS.find((item) => item.id === presetId) ?? GTA6_PRESETS[0];

  async function onCopy() {
    const text = gta6CopyText({
      platform,
      preset: preset.label,
      numbers,
      console: consoleOpts,
    });
    setCopied(await copyPlainText(text));
  }

  return (
    <form
      className={withDiwaliClass("gta6-form", "gta6-form--diwali")}
      onSubmit={(event) => event.preventDefault()}
    >
      <DiwaliCardDiyas />
      <div className="gta6-picks">
        <div className="gta6-pick">
          <p className="gta6-kicker">Platform</p>
          <div className="gta6-pills" role="group" aria-label="Platform">
            {(
              [
                ["ps5", "PS5"],
                ["xbox", "Xbox Series X|S"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={platform === id ? "is-on" : undefined}
                aria-pressed={platform === id}
                onClick={() => setPlatform(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="gta6-pick">
          <p className="gta6-kicker">Preset</p>
          <div className="gta6-pills" role="group" aria-label="Preset">
            {GTA6_PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={presetId === item.id ? "is-on" : undefined}
                aria-pressed={presetId === item.id}
                onClick={() => setPresetId(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="gta6-blurb">
            {preset.blurb} Aim = round(look × {preset.aimRatio}).
          </p>
        </div>
      </div>

      <div className="gta6-sources">
        <label className="gta6-field" htmlFor="gta6-look3">
          <span>GTA 6 third-person look</span>
          <input
            id="gta6-look3"
            inputMode="numeric"
            placeholder="Optional, 0–100"
            value={thirdLook}
            onChange={(event) => setThirdLook(event.target.value)}
          />
        </label>
        <label className="gta6-field" htmlFor="gta6-drift">
          <span>Stick drift</span>
          <input
            id="gta6-drift"
            inputMode="numeric"
            placeholder="Optional, pad on a table"
            value={drift}
            onChange={(event) => setDrift(event.target.value)}
          />
        </label>
      </div>
      <p className="gta6-note">
        Empty third-person look uses the preset. A number sets third-person look only, and third-person aim = round(look × ratio). First-person stays on the preset. Empty drift uses the preset deadzone. A drift number sets both deadzones to that number plus 2.
      </p>

      <Gta6ConsoleFields value={consoleOpts} onChange={setConsoleOpts} />
      <Gta6SensFields
        value={numbers}
        onChange={(key, value) => setNumbers((current) => ({ ...current, [key]: value }))}
      />

      <button type="button" className="gta6-copy" onClick={() => void onCopy()}>
        {copied ? "Copied" : "Copy settings"}
      </button>
    </form>
  );
}
