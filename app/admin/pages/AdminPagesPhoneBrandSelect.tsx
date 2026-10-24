"use client";

import { useEffect, useMemo } from "react";
import { brandsForCloneGame } from "@/src/lib/calculatorPhoneBrand";
import type { CloneGame } from "./adminPagesHelpers";

type Props = {
  game: CloneGame;
  phoneModels: string[];
  value: string;
  onChange: (value: string) => void;
};

export function AdminPagesPhoneBrandSelect({ game, phoneModels, value, onChange }: Props) {
  const options = useMemo(() => brandsForCloneGame(game, phoneModels), [game, phoneModels]);
  const matched = options.find((item) => item.toLowerCase() === value.toLowerCase()) ?? "";

  useEffect(() => {
    if (!value) return;
    if (!matched) onChange("");
    else if (matched !== value) onChange(matched);
  }, [matched, value, onChange]);

  return (
    <select
      value={matched}
      onChange={(event) => onChange(event.target.value)}
      title="Mobile brand"
      aria-label="Mobile brand"
    >
      <option value="">All mobiles</option>
      {options.map((brand) => (
        <option key={brand} value={brand}>
          {brand}
        </option>
      ))}
    </select>
  );
}
