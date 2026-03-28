"use client";

import { useEffect, useMemo, useState } from "react";

type RatingRow = {
  target: string;
  average: string;
  count: number;
};

const FALLBACK_ROWS: RatingRow[] = [
  { target: "Home", average: "4.80", count: 256 },
  { target: "News: Weekly Update", average: "4.60", count: 90 },
];

export default function AdminRatingsPage() {
  const [rows, setRows] = useState<RatingRow[]>(FALLBACK_ROWS);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  async function loadRatings() {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch("/api/admin/ratings", { cache: "no-store", signal: controller.signal });
      if (!res.ok) {
        setMessage("Failed to load ratings.");
        setRows(FALLBACK_ROWS);
        return;
      }
      const json = (await res.json()) as { data?: Array<{ target: string; average: string; count: number }> } | null;
      setRows((json?.data?.length ? json.data : FALLBACK_ROWS) ?? FALLBACK_ROWS);
      setVisibleCount(10);
      setMessage("");
    } catch {
      setMessage("Network error. Please retry.");
      setRows(FALLBACK_ROWS);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRatings();
  }, []);

  const stats = useMemo(() => {
    const totalRatings = rows.reduce((sum, row) => sum + Number(row.count || 0), 0);
    const weightedAvg =
      totalRatings > 0
        ? rows.reduce((sum, row) => sum + Number(row.average || 0) * Number(row.count || 0), 0) / totalRatings
        : 0;
    const topTarget = rows.length
      ? [...rows].sort((a, b) => Number(b.average) - Number(a.average))[0].target
      : "-";

    return {
      totalTargets: rows.length,
      totalRatings,
      weightedAvg: weightedAvg.toFixed(2),
      topTarget,
    };
  }, [rows]);

  const visibleRows = useMemo(() => rows.slice(0, visibleCount), [rows, visibleCount]);
  const hasMore = visibleCount < rows.length;

  return (
    <section className="admin-section admin-ratings-section">
      <div className="admin-ratings-head">
        <h1>Ratings Overview</h1>
        <button
          type="button"
          className="admin-pages-btn admin-pages-btn-preview admin-ratings-refresh"
          onClick={() => {
            void loadRatings();
          }}
        >
          Refresh
        </button>
      </div>

      {message ? <p className="admin-ratings-message">{message}</p> : null}

      <div className="admin-ratings-stats">
        <div className="admin-ratings-stat-card">
          <small>Total Targets</small>
          <strong>{stats.totalTargets}</strong>
        </div>
        <div className="admin-ratings-stat-card">
          <small>Total Ratings</small>
          <strong>{stats.totalRatings}</strong>
        </div>
        <div className="admin-ratings-stat-card">
          <small>Weighted Avg</small>
          <strong>{stats.weightedAvg}</strong>
        </div>
        <div className="admin-ratings-stat-card">
          <small>Top Target</small>
          <strong>{stats.topTarget}</strong>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table admin-ratings-table">
          <thead>
            <tr>
              <th>Target</th>
              <th>Average</th>
              <th>Count</th>
              <th>Health</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>Loading ratings...</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4}>No ratings found.</td>
              </tr>
            ) : (
              visibleRows.map((row, index) => {
                const avg = Number(row.average);
                const health = avg >= 4.5 ? "Excellent" : avg >= 4 ? "Good" : avg >= 3 ? "Average" : "Low";
                return (
                  <tr key={`${row.target}-${index}`}>
                    <td>{row.target}</td>
                    <td>{row.average}</td>
                    <td>{row.count}</td>
                    <td>
                      <span className={`admin-ratings-badge ${health.toLowerCase()}`}>{health}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!loading && hasMore ? (
        <div className="admin-ratings-load-more-wrap">
          <button
            type="button"
            className="admin-pages-btn admin-pages-btn-preview admin-ratings-load-more"
            onClick={() => setVisibleCount((prev) => prev + 10)}
          >
            Load More
          </button>
        </div>
      ) : null}
    </section>
  );
}
