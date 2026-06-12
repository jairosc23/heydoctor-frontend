"use client";

import type { ReactNode } from "react";
import { ClinicalSurface } from "@/components/clinical/design";

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
      className="clinical-encounter-grid hidden xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,3fr)_minmax(0,1fr)] xl:items-start xl:gap-hd-3"
      data-testid="encounter-split-layout"
    >
      <ClinicalSurface depth={5} secondary className="min-w-0 shrink-0 p-hd-4">
        {rail}
      </ClinicalSurface>
      <ClinicalSurface
        depth={3}
        focusPrimary
        className="soap-command-center-shell clinical-focus-primary min-w-0 p-hd-2 shadow-hd-3 ring-1 ring-primary/10"
      >
        {left}
      </ClinicalSurface>
      <ClinicalSurface depth={4} secondary className="min-w-0 p-hd-3">
        {right}
      </ClinicalSurface>
    </div>
  );
}
