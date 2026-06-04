"use client";

import type { ReactNode } from "react";

export interface EncounterSplitLayoutProps {
  rail: ReactNode;
  left: ReactNode;
  right: ReactNode;
}

/** Layout desktop del encounter (viewport ≥1280px / Tailwind `xl`). */
export function EncounterSplitLayout({
  rail,
  left,
  right,
}: EncounterSplitLayoutProps) {
  return (
    <div
      className="hidden xl:grid xl:grid-cols-[auto_minmax(0,3fr)_minmax(0,2fr)] xl:items-start xl:gap-4"
      data-testid="encounter-split-layout"
    >
      <div className="w-56 shrink-0">{rail}</div>
      <div className="min-w-0">{left}</div>
      <div className="min-w-0">{right}</div>
    </div>
  );
}
