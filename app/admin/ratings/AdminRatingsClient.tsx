"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ADMIN_RATINGS_FALLBACK,
  type AdminRatingRow,
} from "@/src/server/repositories/adminRatingsRepository";
import { useAdminFlash } from "@/src/components/admin/AdminToast";

type RatingRow = AdminRatingRow;

type Props = {
  initialRows?: RatingRow[];
};

export default function AdminRatingsClient({ initialRows }: Props) {
  const [rows, setRows] = useState<RatingRow[]>(initialRows ?? ADMIN_RATINGS_FALLBACK);
  const [loading, setLoading] = useState(initialRows === undefined);
  const setMessage = useAdminFlash();
  const [visibleCount, setVisibleCount] = useState(10);

  async function loadRatings() {
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch("/api/admin/ratings", { cache: "no-store", signal: controller.signal });
      if (!res.ok) {
        setMessage("Failed to load ratings.");
        setRows(ADMIN_RATINGS_FALLBACK);
        return;
      }
      const json = (await res.json()) as { data?: Array<{ target: string; average: string; count: number }> } | null;
      setRows((json?.data?.length ? json.data : ADMIN_RATINGS_FALLBACK) ?? ADMIN_RATINGS_FALLBACK);
      setVisibleCount(10);
      setMessage("");
    } catch {
      setMessage("Network error. Please retry.");
      setRows(ADMIN_RATINGS_FALLBACK);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialRows !== undefined) return;
    void loadRatings();
  }, [initialRows]);

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
