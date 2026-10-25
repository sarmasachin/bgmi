"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  AGE_ERROR_MESSAGE,
  calculateSensitivity,
  detectHardwareTier,
  deviceNames,
  validateAge,
  type CalcInputs,
  type CalcResults,
} from "./calculator";
import {
  DEFAULT_FF_TRUST_BAR,
  FF_TRUST_BAR_ICONS,
  type FfTrustBarItem,
} from "@/src/lib/ffTrustBar";
import { FF_SET_ROLE_EVENT } from "@/src/lib/ffPlayModes";
import { FfCalculatorHeader } from "./FfCalculatorHeader";
import { FfDeviceField } from "./FfDeviceField";
import { resolveLockedPhone, searchPhones } from "@/src/lib/calculatorPhoneBrand";
import "./ffCalculator.css";

type Props = {
  isMax?: boolean;
  trustBar?: FfTrustBarItem[];
  /** Play Store CTA — home + FF Max calculator */
  showPlayStoreCta?: boolean;
  /** When set, the device list and calculate action stay on this brand. */
  phoneBrand?: string;
  /** Optional ad above the trust bar (e.g. mobile-only home slot). */
  aboveTrustAd?: ReactNode;
};

export function FfCalculator({
  isMax: _isMax = false,
  trustBar,
  showPlayStoreCta = false,
  phoneBrand,
  aboveTrustAd,
}: Props) {
  const items =
    trustBar && trustBar.length
      ? DEFAULT_FF_TRUST_BAR.map((fallback, index) => ({
          label: trustBar[index]?.label?.trim() || fallback.label,
          sublabel: trustBar[index]?.sublabel?.trim() || fallback.sublabel,
        }))
      : DEFAULT_FF_TRUST_BAR;
  const trustItems =
    phoneBrand?.trim().toLowerCase() === "samsung"
      ? items.map((item, index) =>
          index === 0
            ? { label: "Samsung mobile sensitivity", sublabel: "" }
            : item,
        )
      : items;
  const [deviceName, setDeviceName] = useState("");
  const [profile, setProfile] = useState<CalcInputs["profile"]>("custom");
  const [deviceAge, setDeviceAge] = useState("0.5");
  const [ram, setRam] = useState("6");
  const [dpi, setDpi] = useState<CalcInputs["dpi"]>("nodpi");
  const [fps, setFps] = useState<CalcInputs["fps"]>("60");
  const [fingers, setFingers] = useState("2");
  const [role, setRole] = useState<CalcInputs["role"]>("rusher");
  const [grip, setGrip] = useState<CalcInputs["grip"]>("foregrip3");

  const [ageError, setAgeError] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);
  const [results, setResults] = useState<CalcResults | null>(null);
  const [showDeviceList, setShowDeviceList] = useState(false);

  useEffect(() => {
    function onSetRole(event: Event) {
      const detail = (event as CustomEvent<{ role?: string }>).detail;
      if (
        detail?.role === "rusher" ||
        detail?.role === "sniper" ||
        detail?.role === "flanker" ||
        detail?.role === "headshot"
      ) {
        setRole(detail.role);
      }
    }
    window.addEventListener(FF_SET_ROLE_EVENT, onSetRole);
    return () => window.removeEventListener(FF_SET_ROLE_EVENT, onSetRole);
  }, []);

  const detectedTier = detectHardwareTier(deviceName);
  const deviceSuggestions = searchPhones(deviceNames, phoneBrand, deviceName, true);

  // Visual fire button (display only — reads the already-calculated value).
  // Fire button % is always 35–65; map it to 70–130px and a subtle hue shift.
  const firePct = results ? parseInt(results.fireButton) : null;
  const fireSize =
    firePct === null ? 90 : Math.round(70 + ((firePct - 35) / 30) * 60);
  const fireHue = firePct === null ? 10 : Math.round((firePct - 35) * 1.2);

  function runCalc() {
    const locked = resolveLockedPhone(deviceNames, phoneBrand, deviceName);
    if (!locked.ok) {
      setBrandError(locked.message);
      setAgeError(false);
      setResults(null);
      return;
    }
    setBrandError(null);

    const ageVal = validateAge(deviceAge);
    if (ageVal === null) {
      setAgeError(true);
      return;
    }
    setAgeError(false);

    setResults(
      calculateSensitivity({
        deviceName: locked.name,
        profile,
        deviceAge: ageVal,
        ram: parseInt(ram),
        dpi,
        fps,
        fingers: parseInt(fingers),
        role,
        grip,
      }),
    );
  }

  return (
    <div className="ffc-root">
      <FfCalculatorHeader showPlayStoreCta={showPlayStoreCta} />

      <div className="ffc-card">
        <div className="ffc-form-col">
        <div className="ffc-grid">
          {/* 1. Smart Device Selection */}
          <FfDeviceField
            deviceName={deviceName}
            suggestions={deviceSuggestions}
            showDeviceList={showDeviceList}
            detectedTier={detectedTier}
            brandError={brandError}
            onDeviceName={setDeviceName}
            onFocus={() => setShowDeviceList(true)}
            onBlur={() => setShowDeviceList(false)}
            onPick={(name) => {
              setDeviceName(name);
              setShowDeviceList(false);
              setBrandError(null);
            }}
          />

          {/* 2. Profile Base */}
          <div>
            <label className="ffc-label" htmlFor="ffc-profile">
              <i className="fa-solid fa-gauge"></i> Profile Base
            </label>
            <select
              id="ffc-profile"
              className="ffc-field"
              value={profile}
              onChange={(e) =>
                setProfile(e.target.value as CalcInputs["profile"])
              }
            >
              <option value="custom">Auto Custom</option>
              <option value="high">High Profile</option>
              <option value="standard">Standard Profile</option>
              <option value="low">Low Profile</option>
            </select>
          </div>

          {/* 3. Device Age */}
          <div>
            <label className="ffc-label" htmlFor="ffc-age">
              <i className="fa-solid fa-calendar-days"></i> Age (Years: 0.1-12)
            </label>
            <input
              type="number"
              id="ffc-age"
              className={`ffc-field${ageError ? " ffc-field-error" : ""}`}
              step="0.1"
              min="0.1"
              max="12"
              placeholder="e.g. 1.5"
              value={deviceAge}
              onChange={(e) => setDeviceAge(e.target.value)}
            />
            {ageError ? (
              <p className="ffc-age-error">{AGE_ERROR_MESSAGE}</p>
            ) : null}
          </div>

          {/* 4. RAM Input */}
          <div>
            <label className="ffc-label" htmlFor="ffc-ram">
              <i className="fa-solid fa-memory"></i> RAM
            </label>
            <select
              id="ffc-ram"
              className="ffc-field"
              value={ram}
              onChange={(e) => setRam(e.target.value)}
            >
              <option value="2">2 GB</option>
              <option value="3">3 GB</option>
              <option value="4">4 GB</option>
              <option value="6">6 GB</option>
              <option value="8">8 GB</option>
              <option value="12">12 GB</option>
              <option value="16">16 GB</option>
            </select>
          </div>

          {/* 5. DPI/SPI Usage */}
          <div>
            <label className="ffc-label" htmlFor="ffc-dpi">
              <i className="fa-solid fa-bolt"></i> DPI/SPI Usage
            </label>
            <select
              id="ffc-dpi"
              className="ffc-field"
              value={dpi}
              onChange={(e) => setDpi(e.target.value as CalcInputs["dpi"])}
            >
              <option value="nodpi">No DPI/SPI (Default)</option>
              <option value="mid">Mid DPI/SPI (400-600)</option>
              <option value="high">High DPI/SPI (600+)</option>
            </select>
          </div>

          {/* 6. FPS Input */}
          <div>
            <label className="ffc-label" htmlFor="ffc-fps">
              <i className="fa-solid fa-gauge-high"></i> FPS
            </label>
            <select
              id="ffc-fps"
              className="ffc-field"
              value={fps}
              onChange={(e) => setFps(e.target.value as CalcInputs["fps"])}
            >
              <option value="30">30 FPS</option>
              <option value="60">60 FPS</option>
              <option value="90">90 FPS</option>
              <option value="120">120 FPS</option>
            </select>
          </div>

          {/* 7. Finger Setup */}
          <div>
            <label className="ffc-label" htmlFor="ffc-fingers">
              <i className="fa-solid fa-hand"></i> Finger Setup
            </label>
            <select
              id="ffc-fingers"
              className="ffc-field"
              value={fingers}
              onChange={(e) => setFingers(e.target.value)}
            >
              <option value="2">2 Finger</option>
              <option value="3">3 Finger</option>
              <option value="4">4 Finger</option>
            </select>
          </div>

          {/* 8. Player Role */}
          <div>
            <label className="ffc-label" htmlFor="ffc-role">
              <i className="fa-solid fa-user-ninja"></i> Player Role
            </label>
            <select
              id="ffc-role"
              className="ffc-field"
              value={role}
              onChange={(e) => setRole(e.target.value as CalcInputs["role"])}
            >
              <option value="rusher">Rusher</option>
              <option value="sniper">Sniper</option>
              <option value="flanker">Flanker</option>
              <option value="headshot">Precision aim</option>
            </select>
          </div>

          {/* 9. Attachments */}
          <div>
            <label className="ffc-label" htmlFor="ffc-grip">
              <i className="fa-solid fa-screwdriver-wrench"></i> Attachment
            </label>
            <select
              id="ffc-grip"
              className="ffc-field"
              value={grip}
              onChange={(e) => setGrip(e.target.value as CalcInputs["grip"])}
            >
              <option value="no-grip">None</option>
              <option value="foregrip3">Foregrip 3</option>
              <option value="bipod">Bipod/Silencer</option>
            </select>
          </div>
        </div>

        <button type="button" className="ffc-calc-btn" onClick={runCalc}>
          <i className="fa-solid fa-calculator"></i> Calculate Sensitivity
        </button>
        </div>

        <hr className="ffc-divider" />

        {/* Results Section */}
        <div className={`ffc-results${results ? "" : " ffc-results--empty"}`}>
          <div className="ffc-results-grid">
            <div className="ffc-result-box">
              <span className="ffc-result-label">General</span>
              <span className="ffc-result-value">
                {results ? results.general : "--"}
              </span>
            </div>

            <div className="ffc-result-box">
              <span className="ffc-result-label">Red Dot</span>
              <span className="ffc-result-value">
                {results ? results.redDot : "--"}
              </span>
            </div>

            <div className="ffc-result-box">
              <span className="ffc-result-label">2x Scope</span>
              <span className="ffc-result-value">
                {results ? results.scope2x : "--"}
              </span>
            </div>

            <div className="ffc-result-box">
              <span className="ffc-result-label">4x Scope</span>
              <span className="ffc-result-value">
                {results ? results.scope4x : "--"}
              </span>
            </div>

            <div className="ffc-result-box">
              <span className="ffc-result-label">Sniper Scope</span>
              <span className="ffc-result-value">
                {results ? results.sniper : "--"}
              </span>
            </div>

            <div className="ffc-result-box">
              <span className="ffc-result-label">Free Camera</span>
              <span className="ffc-result-value">
                {results ? results.freeLook : "--"}
              </span>
            </div>
          </div>

          <div className="ffc-firebtn">
            <div className="ffc-firebtn-left">
              <i className="fa-solid fa-circle-dot"></i>
              <span className="ffc-firebtn-label">Fire Button Size</span>
            </div>
            <span className="ffc-firebtn-value">
              {results ? results.fireButton : "--"}
            </span>
          </div>

          <div className="ffc-fire-visual">
            <div
              className="ffc-fire-circle"
              style={{
                width: fireSize,
                height: fireSize,
                background: `radial-gradient(circle at 35% 30%, hsl(${fireHue + 8}, 90%, 60%), hsl(${fireHue}, 85%, 45%) 70%)`,
                boxShadow: `0 0 ${Math.round(fireSize / 4)}px hsla(${fireHue}, 90%, 50%, 0.45)`,
              }}
            >
              <i className="fa-solid fa-fire"></i>
              <span className="ffc-fire-circle-value">
                {results ? results.fireButton : "--"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {aboveTrustAd}
      <ul className="ffc-trust-bar" aria-label="Calculator highlights">
        {trustItems.map((item, index) => (
          <li key={`ff-trust-${index}`} className="ffc-trust-item">
            <i className={`fa-solid ${FF_TRUST_BAR_ICONS[index] ?? "fa-star"}`} aria-hidden />
            <span className="ffc-trust-text">
              <strong>{item.label}</strong>
              {item.sublabel ? <span>{item.sublabel}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
