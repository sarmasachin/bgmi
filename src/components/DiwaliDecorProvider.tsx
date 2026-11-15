"use client";

import { createContext, useContext, type ReactNode } from "react";

const DiwaliDecorContext = createContext(false);

export function DiwaliDecorProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  return <DiwaliDecorContext.Provider value={enabled}>{children}</DiwaliDecorContext.Provider>;
}

export function useDiwaliDecorEnabled(): boolean {
  return useContext(DiwaliDecorContext);
}

/** Append Diwali layout class when admin decorations are on. */
export function useDiwaliClass(base: string, diwaliClass: string): string {
  return useDiwaliDecorEnabled() ? `${base} ${diwaliClass}` : base;
}
