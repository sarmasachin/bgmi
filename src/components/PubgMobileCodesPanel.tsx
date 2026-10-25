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
import { resolveLockedPhone, searchPhones } from "@/src/lib/calculatorPhoneBrand";
import { PubgMobileCodesResults } from "@/src/components/PubgMobileCodesResults";

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
  /** When set, suggestions and calculate stay on this brand. */
  phoneBrand?: string;
};

type ViewMode = "code" | "settings";

export function PubgMobileCodesPanel({ phoneModels, phoneBrand }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [results, setResults] = useState<ScopeResult[] | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("code");
  const [mobileCode, setMobileCode] = useState("---- ---- ---- ---- ---");
  const [presetRows, setPresetRows] = useState<
    Array<{ id: string; codeName: string; code: string }>
  >([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [brandError, setBrandError] = useState<string | null>(null);

  function refreshAllCodes() {
    setMobileCode(generateYourMobileCode());
    setPresetRows(buildFreshPresetCodes());
  }

  useEffect(() => {
    refreshAllCodes();
  }, []);

  const phoneName = form.modelSearch.trim() || "Your mobile";

  const suggestions = useMemo(() => {
    return searchPhones(phoneModels, phoneBrand, form.modelSearch, false);
  }, [form.modelSearch, phoneModels, phoneBrand]);

  function runCalculate() {
    const locked = resolveLockedPhone(phoneModels, phoneBrand, form.modelSearch);
    if (!locked.ok) {
      setBrandError(locked.message);
      setResults(null);
      return;
    }
    setBrandError(null);
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
      modelName: locked.name,
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
    setBrandError(null);
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
                  setBrandError(null);
                }}
              >
                {item}
              </button>
            ))}
          </div>
          {brandError ? (
            <p className="calc-brand-error" role="alert">
              {brandError}
            </p>
          ) : null}
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

      <PubgMobileCodesResults
        results={results}
        viewMode={viewMode}
        phoneName={phoneName}
        mobileCode={mobileCode}
        presetRows={presetRows}
        copiedId={copiedId}
        onCopy={(id, code) => void copyCode(id, code)}
        onViewMode={setViewMode}
      />
    </div>
  );
}
