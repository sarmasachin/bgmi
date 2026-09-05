"use client";

import { useEffect, useMemo, useState } from "react";
import type { PlayerRole } from "./calculator";
import {
  calculateLiteSensitivity,
  type LiteScopeResult,
} from "./liteCalculator";
import { formatLiteResultsText, liteBrandCopy } from "./liteBrandCopy";
import {
  LITE_DEFAULT_PHONE_MODELS,
  liteAgeOptions,
  liteFingerOptions,
  liteFpsOptions,
  liteGyroModeOptions,
  litePlayerRoleOptions,
  liteRamOptions,
} from "./liteConstants";
import type { LiteCalcBrand } from "@/src/lib/gamePagePath";
import {
  LITE_SET_PLAY_STYLE_EVENT,
  type LiteSetPlayStyleDetail,
} from "@/src/lib/litePlayModes";
import "./liteCalculator.css";

type GyroMode = "off" | "scope-on" | "always-on";

type FormState = {
  modelSearch: string;
  ramSize: number;
  fpsMode: number;
  playerRole: PlayerRole;
  baseValue: number;
  age: number;
  fingers: number;
  gyroMode: GyroMode;
};

const initialForm: FormState = {
  modelSearch: "",
  ramSize: 1.15,
  fpsMode: 1.0,
  playerRole: "balanced",
  baseValue: 120,
  age: 1.0,
  fingers: 1.1,
  gyroMode: "scope-on",
};

type Props = {
  phoneModels?: string[];
  brand?: LiteCalcBrand;
  banner?: { strong?: string; rest?: string };
};

export function LiteSensCalculator({ phoneModels, brand = "bgmi-lite", banner }: Props) {
  const copy = liteBrandCopy(brand);
  const bannerStrong = banner?.strong?.trim() || copy.bannerStrong;
  const bannerRest = banner?.rest?.trim() || copy.bannerRest;
  const models = phoneModels?.length
    ? phoneModels
    : [...LITE_DEFAULT_PHONE_MODELS];
  const [form, setForm] = useState<FormState>(initialForm);
  const [results, setResults] = useState<LiteScopeResult[] | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    function onPlayStyle(event: Event) {
      const detail = (event as CustomEvent<LiteSetPlayStyleDetail>).detail;
      const role = detail?.playerRole;
      if (role !== "balanced" && role !== "assaulter" && role !== "sniper") return;
      setForm((prev) => ({ ...prev, playerRole: role }));
    }
    window.addEventListener(LITE_SET_PLAY_STYLE_EVENT, onPlayStyle);
    return () => window.removeEventListener(LITE_SET_PLAY_STYLE_EVENT, onPlayStyle);
  }, []);

  const suggestions = useMemo(() => {
    const value = form.modelSearch.toLowerCase().trim();
    if (!value) return [];
    return models
      .filter((phone) => phone.toLowerCase().includes(value))
      .slice(0, 80);
  }, [form.modelSearch, models]);

  function runCalculate() {
    const gyroType = form.gyroMode === "off" ? "non-gyro" : "gyro";
    setResults(
      calculateLiteSensitivity({
        baseValue: form.baseValue || 120,
        ramMultiplier: form.ramSize,
        gyroType,
        ageMultiplier: form.age,
        fingerMultiplier: form.fingers,
        fpsMultiplier: form.fpsMode,
        playerRole: form.playerRole,
        modelName: form.modelSearch,
        gyroMode: form.gyroMode,
      }),
    );
    setCopyState("idle");
  }

  function resetForm() {
    setForm(initialForm);
    setResults(null);
    setShowSuggestions(false);
    setCopyState("idle");
  }

  async function copyResults() {
    if (!results) return;
    try {
      await navigator.clipboard.writeText(formatLiteResultsText(results, copy.copyTitle));
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div id={copy.id} className="lite-calc">
      <p className="lite-calc__banner" role="note">
        <strong>{bannerStrong}</strong>
        {bannerRest}
      </p>

      <div className="main-wrapper">
        <form
          className="calc-card"
          onSubmit={(e) => {
            e.preventDefault();
            runCalculate();
          }}
        >
          <div className="form-group">
            <label htmlFor="liteModelSearch">Phone model</label>
            <input
              id="liteModelSearch"
              value={form.modelSearch}
              placeholder="Redmi, Realme, Infinix, Tecno…"
              onChange={(event) => {
                setForm((prev) => ({ ...prev, modelSearch: event.target.value }));
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                window.setTimeout(() => setShowSuggestions(false), 150);
              }}
              autoComplete="off"
            />
            <div
              className="suggestion-box"
              style={{
                display:
                  showSuggestions && suggestions.length > 0 ? "block" : "none",
              }}
            >
              {suggestions.map((phone) => (
                <button
                  key={phone}
                  type="button"
                  className="suggestion-item"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    setForm((prev) => ({ ...prev, modelSearch: phone }));
                    setShowSuggestions(false);
                  }}
                >
                  {phone}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-half">
            <div className="form-group">
              <label htmlFor="liteRam">RAM</label>
              <select
                id="liteRam"
                value={form.ramSize}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    ramSize: Number(event.target.value),
                  }))
                }
              >
                {liteRamOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="liteFps">Stable FPS</label>
              <select
                id="liteFps"
                value={form.fpsMode}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    fpsMode: Number(event.target.value),
                  }))
                }
              >
                {liteFpsOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-half">
            <div className="form-group">
              <label htmlFor="lite-play-style">Play style</label>
              <select
                id="lite-play-style"
                value={form.playerRole}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    playerRole: event.target.value as PlayerRole,
                  }))
                }
              >
                {litePlayerRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="liteGyroMode">Gyroscope mode</label>
              <select
                id="liteGyroMode"
                value={form.gyroMode}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    gyroMode: event.target.value as GyroMode,
                  }))
                }
              >
                {liteGyroModeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-half">
            <div className="form-group">
              <label htmlFor="liteAge">Device age</label>
              <select
                id="liteAge"
                value={form.age}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, age: Number(event.target.value) }))
                }
              >
                {liteAgeOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="liteFingers">Finger setup</label>
              <select
                id="liteFingers"
                value={form.fingers}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    fingers: Number(event.target.value),
                  }))
                }
              >
                {liteFingerOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="liteBase">Base no-scope feel</label>
            <input
              id="liteBase"
              type="number"
              min={80}
              max={180}
              value={form.baseValue}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  baseValue: Number(event.target.value),
                }))
              }
            />
          </div>

          <div className="btn-group">
            <button className="btn-calc" type="submit">
              Calculate
            </button>
            <button className="btn-reset" type="button" onClick={resetForm}>
              Reset
            </button>
          </div>
        </form>

        <section
          className={`result-card${results ? " result-card--has-results" : ""}`}
        >
          {results ? (
            <div id="lite_res_section">
              <div className="tabs">
                <div className="tab-box">
                  <div className="tab-title">CAMERA</div>
                  {results.map((item) => (
                    <div className="res-item" key={`cam-${item.name}`}>
                      <span>{item.name}</span>
                      <b>{item.camera}%</b>
                    </div>
                  ))}
                </div>
                <div className="tab-box">
                  <div className="tab-title ads">ADS</div>
                  {results.map((item) => (
                    <div className="res-item" key={`ads-${item.name}`}>
                      <span>{item.name}</span>
                      <b>{item.ads}%</b>
                    </div>
                  ))}
                </div>
                <div className="tab-box">
                  <div className="tab-title gyro">GYROSCOPE</div>
                  {results.map((item) => (
                    <div className="res-item" key={`gyro-${item.name}`}>
                      <span>{item.name}</span>
                      <b>{item.gyro}%</b>
                    </div>
                  ))}
                </div>
              </div>
              <p className="lite-calc__hint">
                Scope On is safer on 2GB phones. If sprays climb, raise gyro +5–10
                for that scope; if the crosshair shakes, lower it.
              </p>
              <div className="lite-calc__actions">
                <button
                  type="button"
                  className="lite-calc__copy"
                  onClick={() => void copyResults()}
                >
                  {copyState === "copied"
                    ? "Copied"
                    : copyState === "failed"
                      ? "Copy failed — select text"
                      : "Copy all settings"}
                </button>
              </div>
            </div>
          ) : (
            <div className="result-pre-msg">{copy.empty}</div>
          )}
        </section>
      </div>
    </div>
  );
}
