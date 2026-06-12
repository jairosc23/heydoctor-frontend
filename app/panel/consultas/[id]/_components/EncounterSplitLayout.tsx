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
      className="hidden xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,3fr)_minmax(0,1fr)] xl:items-start xl:gap-2"
      data-testid="encounter-split-layout"
    >
      <div className="min-w-0 shrink-0">{rail}</div>
      <div className="min-w-0">{left}</div>
      <div className="min-w-0">{right}</div>
    </div>
  );
}
