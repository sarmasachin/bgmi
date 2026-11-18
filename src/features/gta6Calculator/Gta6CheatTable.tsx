"use client";

import { useMemo, useState } from "react";
import type { Gta6CheatRow } from "@/src/lib/gta6PageTypes";

export function Gta6CheatTable({ rows: source }: { rows: Gta6CheatRow[] }) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const filters = useMemo(() => {
    const groups = source.filter((row) => row.kind === "group");
    return [
      { id: "All", label: "GTA 6 All Cheat Codes" },
      ...groups.map((row) => ({ id: row.label, label: row.filterLabel || row.label })),
    ];
  }, [source]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let activeGroup: string | null = null;
    const out: Gta6CheatRow[] = [];
    for (const row of source) {
      if (row.kind === "group") {
        activeGroup = row.label;
        continue;
      }
      if (filter !== "All" && activeGroup !== filter) continue;
      if (q && !row.name.toLowerCase().includes(q)) continue;
      if (activeGroup && !out.some((item) => item.kind === "group" && item.label === activeGroup)) {
        const group = source.find((item) => item.kind === "group" && item.label === activeGroup);
        if (group) out.push(group);
      }
      out.push(row);
    }
    return out;
  }, [filter, query, source]);

  return (
    <div className="gta6-cheat-board">
      <div className="gta6-cheat-table-bar">
        <div className="gta6-cheat-filters">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={filter === item.id ? "gta6-cheat-filter is-on" : "gta6-cheat-filter"}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="gta6-cheat-search-wrap">
          <span className="sr-only">Search cheats</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search…"
            className="gta6-cheat-search"
          />
        </label>
      </div>

      <div className="gta6-cheat-table-scroll">
        <table className="gta6-cheat-grid">
          <colgroup>
            <col className="gta6-cheat-col-effect" />
            <col className="gta6-cheat-col-ps" />
            <col className="gta6-cheat-col-xb" />
            <col className="gta6-cheat-col-pc" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" className="gta6-cheat-th">
                Effect
              </th>
              <th scope="col" className="gta6-cheat-th">
                GTA 6 PS5 Cheat Code
              </th>
              <th scope="col" className="gta6-cheat-th">
                GTA 6 Xbox Cheat Code
              </th>
              <th scope="col" className="gta6-cheat-th">
                GTA 6 PC Cheat Code
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="gta6-cheat-td gta6-cheat-empty">
                  No matches.
                </td>
              </tr>
            ) : (
              rows.map((row) =>
                row.kind === "group" ? (
                  <tr key={row.label}>
                    <th colSpan={4} scope="colgroup" className="gta6-cheat-group">
                      {row.label}
                    </th>
                  </tr>
                ) : (
                  <tr key={row.name}>
                    <th scope="row" className="gta6-cheat-name">
                      {row.name}
                    </th>
                    <td className="gta6-cheat-td">
                      <span className="gta6-cheat-code">{row.ps5}</span>
                    </td>
                    <td className="gta6-cheat-td">
                      <span className="gta6-cheat-code">{row.xbox}</span>
                    </td>
                    <td className="gta6-cheat-td">
                      <span className="gta6-cheat-code">{row.pc}</span>
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
