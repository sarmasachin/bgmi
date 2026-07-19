"use client";

import { useMemo, useState } from "react";
import {
  calculateSensitivity,
  GyroType,
  PlayerRole,
  ScopeResult,
} from "./calculator";
import {
  ageOptions,
  attachmentOptions,
  fingerOptions,
  fpsOptions,
  gyroOptions,
  playerRoleOptions,
  ramOptions,
} from "./constants";

type FormState = {
  modelSearch: string;
  ramSize: number;
  fpsMode: number;
  attachment: number;
  playerRole: PlayerRole;
  baseValue: number;
  ipadView: boolean;
  age: number;
  fingers: number;
  gyro: GyroType;
};

const initialForm: FormState = {
  modelSearch: "",
  ramSize: 1.0,
  fpsMode: 1.0,
  attachment: 1.0,
  playerRole: "balanced",
  baseValue: 120,
  ipadView: false,
  age: 1.0,
  fingers: 1.0,
  gyro: "gyro",
};

type Props = {
  /** Search suggestions only; does not change sensitivity math (modelName stays user text). */
  phoneModels: string[];
  /** Display text only — calculator math stays the same. */
  game?: "bgmi" | "pubg";
};

export function SensCalculator({ phoneModels, game = "bgmi" }: Props) {
  const gameLabel = game === "pubg" ? "PUBG Mobile" : "BGMI";
  const [form, setForm] = useState<FormState>(initialForm);
  const [results, setResults] = useState<ScopeResult[] | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const value = form.modelSearch.toLowerCase().trim();
    if (!value) return [];
    const matched = phoneModels.filter((phone) => phone.toLowerCase().includes(value));
    // Keep dropdown usable when hundreds of models match.
    return matched.slice(0, 80);
  }, [form.modelSearch, phoneModels]);

  function runCalculate() {
    const response = calculateSensitivity({
      baseValue: form.baseValue || 120,
      ramMultiplier: form.ramSize,
      gyroType: form.gyro,
      ageMultiplier: form.age,
      fingerMultiplier: form.fingers,
      ipadView: form.ipadView,
      fpsMultiplier: form.fpsMode,
      attachmentMultiplier: form.attachment,
      playerRole: form.playerRole,
      modelName: form.modelSearch,
    });
    setResults(response);
  }

  function resetForm() {
    setForm(initialForm);
    setResults(null);
    setShowSuggestions(false);
  }

  return (
    <div className="main-wrapper">
      <form
        className="calc-card"
        onSubmit={(e) => {
          e.preventDefault();
          runCalculate();
        }}
      >
        <div className="form-group">
          <label htmlFor="modelSearch">Search phone model</label>
          <input
            id="modelSearch"
            value={form.modelSearch}
            placeholder="iPhone, Poco, ROG, OnePlus..."
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
            {suggestions.map((item) => (
              <button
                type="button"
                key={item}
                className="suggestion-item"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setForm((prev) => ({ ...prev, modelSearch: item }));
                  setShowSuggestions(false);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid-half">
          <div className="form-group">
            <label htmlFor="ramSize">Phone RAM</label>
            <select
              id="ramSize"
              value={form.ramSize}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  ramSize: Number(event.target.value),
                }))
              }
            >
              {ramOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="fpsMode">Gaming FPS mode</label>
            <select
              id="fpsMode"
              value={form.fpsMode}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  fpsMode: Number(event.target.value),
                }))
              }
            >
              {fpsOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-half">
          <div className="form-group">
            <label htmlFor="attachment">Attachment / Grip</label>
            <select
              id="attachment"
              value={form.attachment}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  attachment: Number(event.target.value),
                }))
              }
            >
              {attachmentOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="playerRole">Play style (Player role)</label>
            <select
              id="playerRole"
              value={form.playerRole}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  playerRole: event.target.value as PlayerRole,
                }))
              }
            >
              {playerRoleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="baseValue">Base no-scope value</label>
          <input
            id="baseValue"
            type="number"
            value={form.baseValue}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                baseValue: Number(event.target.value),
              }))
            }
          />
        </div>

        <div className="checkbox-row checkbox-row--start">
          <label className="check-item">
            <input
              type="checkbox"
              checked={form.ipadView}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, ipadView: event.target.checked }))
              }
            />
            iPad View / 90 FOV
          </label>
        </div>

        <div className="grid-half">
          <div className="form-group">
            <label htmlFor="age">Device age</label>
            <select
              id="age"
              value={form.age}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, age: Number(event.target.value) }))
              }
            >
              {ageOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="fingers">Finger setup</label>
            <select
              id="fingers"
              value={form.fingers}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  fingers: Number(event.target.value),
                }))
              }
            >
              {fingerOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="gyro">Control type</label>
          <select
            id="gyro"
            value={form.gyro}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                gyro: event.target.value as GyroType,
              }))
            }
          >
            {gyroOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="btn-group">
          <button className="btn-calc" type="button" onClick={runCalculate}>
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
          <div id="res_section">
            <div className="tabs">
              <div className="tab-box">
                <div className="tab-title">CAMERA</div>
                {results.map((item) => (
                  <div className="res-item" key={`camera-${item.name}`}>
                    <span>{item.name}</span>
                    <b>{item.camera}%</b>
                  </div>
                ))}
              </div>
              <div className="tab-box">
                <div className="tab-title ads">ADS / GYRO</div>
                {results.map((item) => (
                  <div className="res-item" key={`ads-${item.name}`}>
                    <span>{item.name}</span>
                    <b>{item.ads}%</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="result-pre-msg">
            Fill in the details and tap Calculate for {gameLabel}
          </div>
        )}
      </section>
    </div>
  );
}
