"use client";

import { useMemo, useState } from "react";
import { calculateSensitivity, ScopeResult } from "./calculator";
import { ageOptions, fingerOptions, gyroOptions, ramOptions } from "./constants";

type FormState = {
  modelSearch: string;
  ramSize: number;
  baseValue: number;
  ipadView: boolean;
  fps90: boolean;
  age: number;
  fingers: number;
  gyro: number;
};

const initialForm: FormState = {
  modelSearch: "",
  ramSize: 1,
  baseValue: 120,
  ipadView: false,
  fps90: false,
  age: 1,
  fingers: 1,
  gyro: 1,
};

type Props = {
  /** Search suggestions only; does not change sensitivity math (modelName stays user text). */
  phoneModels: string[];
};

export function SensCalculator({ phoneModels }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [results, setResults] = useState<ScopeResult[] | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const value = form.modelSearch.toLowerCase().trim();
    if (!value) return [];
    return phoneModels.filter((phone) => phone.toLowerCase().includes(value));
  }, [form.modelSearch, phoneModels]);

  function runCalculate() {
    const response = calculateSensitivity({
      baseValue: form.baseValue || 120,
      ramMultiplier: form.ramSize,
      gyroMultiplier: form.gyro,
      ageMultiplier: form.age,
      fingerMultiplier: form.fingers,
      ipadView: form.ipadView,
      fps90: form.fps90,
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
          <label htmlFor="modelSearch">फोन मॉडल सर्च करें</label>
          <input
            id="modelSearch"
            value={form.modelSearch}
            placeholder="iPhone, Poco, ROG, OnePlus..."
            onChange={(event) => {
              setForm((prev) => ({ ...prev, modelSearch: event.target.value }));
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
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

        <div className="form-group">
          <label htmlFor="ramSize">फोन की RAM चुनें (2GB - 24GB)</label>
          <select
            id="ramSize"
            value={form.ramSize}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, ramSize: Number(event.target.value) }))
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
          <label htmlFor="baseValue">बेस नो-स्कोप वैल्यू (Base)</label>
          <input
            id="baseValue"
            type="number"
            value={form.baseValue}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, baseValue: Number(event.target.value) }))
            }
          />
        </div>

        <div className="checkbox-row">
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
          <label className="check-item">
            <input
              type="checkbox"
              checked={form.fps90}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, fps90: event.target.checked }))
              }
            />
            90 FPS Mode
          </label>
        </div>

        <div className="grid-half">
          <div className="form-group">
            <label htmlFor="age">डिवाइस की उम्र</label>
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
            <label htmlFor="fingers">फिंगर सेटअप</label>
            <select
              id="fingers"
              value={form.fingers}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, fingers: Number(event.target.value) }))
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
          <label htmlFor="gyro">कंट्रोल (Type)</label>
          <select
            id="gyro"
            value={form.gyro}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, gyro: Number(event.target.value) }))
            }
          >
            {gyroOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="btn-group">
          <button className="btn-calc" type="button" onClick={runCalculate}>
            कैलकुलेट करें
          </button>
          <button className="btn-reset" type="button" onClick={resetForm}>
            रिसेट
          </button>
        </div>
      </form>

      <section className={`result-card${results ? " result-card--has-results" : ""}`}>
        {results ? (
          <div id="res_section">
            <div className="tabs">
              <div className="tab-box">
                <div className="tab-title">CAMERA</div>
                {results.map((item) => (
                  <div className="res-item" key={`camera-${item.name}`}>
                    <span>{item.name}</span>
                    <b>{item.camera}</b>
                  </div>
                ))}
              </div>
              <div className="tab-box">
                <div className="tab-title ads">ADS</div>
                {results.map((item) => (
                  <div className="res-item" key={`ads-${item.name}`}>
                    <span>{item.name}</span>
                    <b>{item.ads}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
