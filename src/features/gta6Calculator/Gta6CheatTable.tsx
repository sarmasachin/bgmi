"use client";

import { useMemo, useState } from "react";
import { GTA6_CHEAT_ROWS } from "@/src/features/gta6Calculator/gta6-cheat-rows";

const FILTERS = [
  { id: "All", label: "GTA 6 All Cheat Codes" },
  { id: "Weapons and health", label: "GTA 6 Weapons Cheat Code" },
  { id: "Police", label: "GTA 6 Police Cheat Code" },
  { id: "Movement", label: "GTA 6 Movement Cheat Code" },
  { id: "Vehicles", label: "GTA 6 Vehicles Cheat Code" },
  { id: "Street and world", label: "GTA 6 World Cheat Code" },
  { id: "Phone and character", label: "GTA 6 Phone Cheat Code" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

export function Gta6CheatTable() {
  const [filter, setFilter] = useState<FilterId>("All");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let activeGroup: string | null = null;
    const out: typeof GTA6_CHEAT_ROWS = [];
    for (const row of GTA6_CHEAT_ROWS) {
      if (row.kind === "group") {
        activeGroup = row.label;
        continue;
      }
      if (filter !== "All" && activeGroup !== filter) continue;
      if (q && !row.name.toLowerCase().includes(q)) continue;
      if (activeGroup && !out.some((item) => item.kind === "group" && item.label === activeGroup)) {
        out.push({ kind: "group", label: activeGroup });
      }
      out.push(row);
    }
    return out;
  }, [filter, query]);

  return (
    <div className="gta6-cheat-board">
      <div className="gta6-cheat-table-bar">
        <div className="gta6-cheat-filters">
          {FILTERS.map((item) => (
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
