import type { Gta6Console } from "@/src/features/gta6Calculator/gta6-presets";

export type { Gta6Console };

type Props = {
  value: Gta6Console;
  onChange: (next: Gta6Console) => void;
};

function LevelSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Gta6Console["haptic"];
  onChange: (next: Gta6Console["haptic"]) => void;
}) {
  const id = `gta6-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <label className="gta6-field" htmlFor={id}>
      <span>{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value as Gta6Console["haptic"])}>
        <option value="off">Off</option>
        <option value="low">Low</option>
        <option value="high">High</option>
      </select>
    </label>
  );
}

export function Gta6ConsoleFields({ value, onChange }: Props) {
  const patch = (part: Partial<Gta6Console>) => onChange({ ...value, ...part });

  return (
    <div className="gta6-console">
      <label className="gta6-field" htmlFor="gta6-targeting">
        <span>Targeting</span>
        <select id="gta6-targeting" value={value.targeting} onChange={() => patch({ targeting: "free" })}>
          <option value="free">Free aim — check at launch</option>
        </select>
      </label>
      <LevelSelect label="Haptic feedback" value={value.haptic} onChange={(haptic) => patch({ haptic })} />
      <LevelSelect label="Adaptive triggers" value={value.triggers} onChange={(triggers) => patch({ triggers })} />
      <label className="gta6-field" htmlFor="gta6-invert">
        <span>Invert look</span>
        <select
          id="gta6-invert"
          value={value.invert}
          onChange={(event) => patch({ invert: event.target.value as Gta6Console["invert"] })}
        >
          <option value="off">Off</option>
          <option value="on">On</option>
        </select>
      </label>
      <label className="gta6-field" htmlFor="gta6-control">
        <span>Control type</span>
        <select
          id="gta6-control"
          value={value.controlType}
          onChange={(event) => patch({ controlType: event.target.value as Gta6Console["controlType"] })}
        >
          <option value="standard">Standard</option>
          <option value="fps">FPS</option>
          <option value="southpaw">Southpaw</option>
        </select>
      </label>
      <label className="gta6-field" htmlFor="gta6-zoom">
        <span>Movement while zoomed</span>
        <select
          id="gta6-zoom"
          value={value.zoomMove}
          onChange={(event) => patch({ zoomMove: event.target.value as Gta6Console["zoomMove"] })}
        >
          <option value="on">On</option>
          <option value="off">Off</option>
        </select>
      </label>
      <label className="gta6-field" htmlFor="gta6-driveby">
        <span>Drive-by</span>
        <select
          id="gta6-driveby"
          value={value.driveBy}
          onChange={(event) => patch({ driveBy: event.target.value as Gta6Console["driveBy"] })}
        >
          <option value="aim-fire">Aim + Fire</option>
          <option value="aim">Aim</option>
        </select>
      </label>
      <label className="gta6-field" htmlFor="gta6-speaker">
        <span>Controller speaker</span>
        <select
          id="gta6-speaker"
          value={value.speaker}
          onChange={(event) => patch({ speaker: event.target.value as Gta6Console["speaker"] })}
        >
          <option value="on">On</option>
          <option value="off">Off</option>
        </select>
      </label>
      <label className="gta6-field" htmlFor="gta6-sprint">
        <span>Sprint</span>
        <select id="gta6-sprint" value={value.sprint} onChange={() => patch({ sprint: "l3" })}>
          <option value="l3">L3 click — check at launch</option>
        </select>
      </label>
    </div>
  );
}
