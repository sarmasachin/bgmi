"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calculateSensitivity,
  GyroType,
  PlayerRole,
  ScopeResult,
} from "@/src/features/sensCalculator/calculator";
import {
  ageOptions,
  attachmentOptions,
  fingerOptions,
  fpsOptions,
  gyroOptions,
  playerRoleOptions,
  ramOptions,
} from "@/src/features/sensCalculator/constants";
import {
  buildFreshPresetCodes,
  generateYourMobileCode,
} from "@/src/lib/pubgMobileCodes";

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
  phoneModels: string[];
};

type ViewMode = "code" | "settings";

function CopyIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PubgMobileCodesPanel({ phoneModels }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [results, setResults] = useState<ScopeResult[] | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("code");
  const [mobileCode, setMobileCode] = useState("---- ---- ---- ---- ---");
  const [presetRows, setPresetRows] = useState<
    Array<{ id: string; codeName: string; code: string }>
  >([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function refreshAllCodes() {
    setMobileCode(generateYourMobileCode());
    setPresetRows(buildFreshPresetCodes());
  }

  useEffect(() => {
    refreshAllCodes();
  }, []);

  const phoneName = form.modelSearch.trim() || "Your mobile";

  const suggestions = useMemo(() => {
    const value = form.modelSearch.toLowerCase().trim();
    if (!value) return [];
    const matched = phoneModels.filter((phone) => phone.toLowerCase().includes(value));
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
    refreshAllCodes();
    setViewMode("code");
    setCopiedId(null);
  }

  function resetForm() {
    setForm(initialForm);
    setResults(null);
    setViewMode("code");
    setShowSuggestions(false);
    setCopiedId(null);
    refreshAllCodes();
  }

  async function copyCode(id: string, code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setCopiedId(null);
    }
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
          <label htmlFor="pmc-modelSearch">Search phone model</label>
          <input
            id="pmc-modelSearch"
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
              display: showSuggestions && suggestions.length > 0 ? "block" : "none",
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
            <label htmlFor="pmc-ramSize">Phone RAM</label>
            <select
              id="pmc-ramSize"
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
            <label htmlFor="pmc-fpsMode">Gaming FPS mode</label>
            <select
              id="pmc-fpsMode"
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
            <label htmlFor="pmc-attachment">Attachment / Grip</label>
            <select
              id="pmc-attachment"
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
            <label htmlFor="pmc-playerRole">Play style (Player role)</label>
            <select
              id="pmc-playerRole"
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
          <label htmlFor="pmc-baseValue">Base no-scope value</label>
          <input
            id="pmc-baseValue"
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
            <label htmlFor="pmc-age">Device age</label>
            <select
              id="pmc-age"
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
            <label htmlFor="pmc-fingers">Finger setup</label>
            <select
              id="pmc-fingers"
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
          <label htmlFor="pmc-gyro">Control type</label>
          <select
            id="pmc-gyro"
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

      <section className={`result-card${results ? " result-card--has-results" : ""}`}>
        {results ? (
          <div id="pmc_res_section">
            {viewMode === "code" ? (
              <div className="pmc-code-table-wrap">
                <table className="pmc-code-table">
                  <thead>
                    <tr>
                      <th>Code Name</th>
                      <th>Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{phoneName}</td>
                      <td>
                        <div className="pmc-code-cell">
                          <code className="pmc-code-value">{mobileCode}</code>
                          <button
                            type="button"
                            className="pmc-copy-btn"
                            onClick={() => copyCode("phone", mobileCode)}
                            aria-label={`Copy ${phoneName} code`}
                            title="Copy code"
                          >
                            <CopyIcon />
                          </button>
                          {copiedId === "phone" ? (
                            <span className="pmc-copy-hint">Copied!</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                    {presetRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.codeName}</td>
                        <td>
                          <div className="pmc-code-cell">
                            <code className="pmc-code-value">{row.code}</code>
                            <button
                              type="button"
                              className="pmc-copy-btn"
                              onClick={() => copyCode(row.id, row.code)}
                              aria-label={`Copy ${row.codeName} code`}
                              title="Copy code"
                            >
                              <CopyIcon />
                            </button>
                            {copiedId === row.id ? (
                              <span className="pmc-copy-hint">Copied!</span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
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
            )}

            <div className="pmc-result-actions">
              {viewMode === "code" ? (
                <button
                  type="button"
                  className="pmc-btn"
                  onClick={() => setViewMode("settings")}
                >
                  Show sensitivity settings
                </button>
              ) : (
                <button type="button" className="pmc-btn" onClick={() => setViewMode("code")}>
                  Show code
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="result-pre-msg">
            Fill in the details and tap Calculate for PUBG Mobile Code
          </div>
        )}
      </section>
    </div>
  );
}
