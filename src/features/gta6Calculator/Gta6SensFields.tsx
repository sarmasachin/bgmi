import type { Gta6Numbers } from "@/src/features/gta6Calculator/gta6-presets";

const ROWS: { key: keyof Gta6Numbers; label: string }[] = [
  { key: "aim3", label: "Third-person aim" },
  { key: "look1", label: "First-person look" },
  { key: "aim1", label: "First-person aim" },
  { key: "look3", label: "Third-person look" },
  { key: "deadzone3", label: "Third-person deadzone" },
  { key: "deadzone1", label: "First-person deadzone" },
  { key: "accel3", label: "Third-person acceleration" },
  { key: "accel1", label: "First-person acceleration" },
];

type Props = {
  value: Gta6Numbers;
  onChange: (key: keyof Gta6Numbers, value: number) => void;
};

export function Gta6SensFields({ value, onChange }: Props) {
  return (
    <div className="gta6-sliders">
      {ROWS.map((row) => {
        const id = `gta6-${row.key}`;
        const current = value[row.key];
        return (
          <label key={row.key} className="gta6-slider" htmlFor={id}>
            <span className="gta6-slider-top">
              <span>{row.label}</span>
              <span className="gta6-slider-value">{current}%</span>
            </span>
            <input
              id={id}
              type="range"
              min={0}
              max={100}
              step={1}
              value={current}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={current}
              aria-valuetext={`${current} percent`}
              onChange={(event) => onChange(row.key, Number(event.target.value))}
            />
          </label>
        );
      })}
    </div>
  );
}
