"use client";

type Props = {
  deviceName: string;
  suggestions: string[];
  showDeviceList: boolean;
  detectedTier: string | null;
  brandError: string | null;
  onDeviceName: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  onPick: (name: string) => void;
};

export function FfDeviceField({
  deviceName,
  suggestions,
  showDeviceList,
  detectedTier,
  brandError,
  onDeviceName,
  onFocus,
  onBlur,
  onPick,
}: Props) {
  return (
    <div className="ffc-span-2">
      <label className="ffc-label" htmlFor="ffc-device">
        <i className="fa-solid fa-mobile-screen"></i> Device Name (Top 30 or type)
      </label>
      <div className="ffc-device-wrap">
        <input
          id="ffc-device"
          className="ffc-field"
          placeholder="e.g. iPhone 15 Pro, Poco X6 Pro, iQOO Neo 9..."
          value={deviceName}
          autoComplete="off"
          onChange={(e) => onDeviceName(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {showDeviceList && suggestions.length > 0 ? (
          <ul className="ffc-device-list" role="listbox">
            {suggestions.map((name) => (
              <li
                key={name}
                role="option"
                aria-selected={name === deviceName}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onPick(name);
                }}
              >
                {name}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {brandError ? (
        <p className="ffc-brand-error" role="alert">
          {brandError}
        </p>
      ) : null}
      {detectedTier ? (
        <span className="ffc-detect-badge">
          <i className="fa-solid fa-microchip"></i>
          {detectedTier}
        </span>
      ) : null}
    </div>
  );
}
