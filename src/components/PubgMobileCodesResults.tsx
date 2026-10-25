"use client";

import type { ScopeResult } from "@/src/features/sensCalculator/calculator";

type ViewMode = "code" | "settings";

type PresetRow = { id: string; codeName: string; code: string };

type Props = {
  results: ScopeResult[] | null;
  viewMode: ViewMode;
  phoneName: string;
  mobileCode: string;
  presetRows: PresetRow[];
  copiedId: string | null;
  onCopy: (id: string, code: string) => void;
  onViewMode: (mode: ViewMode) => void;
};

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

export function PubgMobileCodesResults({
  results,
  viewMode,
  phoneName,
  mobileCode,
  presetRows,
  copiedId,
  onCopy,
  onViewMode,
}: Props) {
  return (
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
                          onClick={() => onCopy("phone", mobileCode)}
                          aria-label={`Copy ${phoneName} code`}
                          title="Copy code"
                        >
                          <CopyIcon />
                        </button>
                        {copiedId === "phone" ? <span className="pmc-copy-hint">Copied!</span> : null}
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
                            onClick={() => onCopy(row.id, row.code)}
                            aria-label={`Copy ${row.codeName} code`}
                            title="Copy code"
                          >
                            <CopyIcon />
                          </button>
                          {copiedId === row.id ? <span className="pmc-copy-hint">Copied!</span> : null}
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
              <button type="button" className="pmc-btn" onClick={() => onViewMode("settings")}>
                Show sensitivity settings
              </button>
            ) : (
              <button type="button" className="pmc-btn" onClick={() => onViewMode("code")}>
                Show code
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="result-pre-msg">Fill in the details and tap Calculate for PUBG Mobile Code</div>
      )}
    </section>
  );
}
