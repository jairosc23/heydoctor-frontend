"use client";

import type { ReactNode } from "react";
import { ClinicalSurface } from "@/components/clinical/design";
import { cn } from "@/lib/utils";

export interface EncounterSplitLayoutProps {
  rail: ReactNode;
  left: ReactNode;
  right?: ReactNode;
  /** Phase 4.2.2 — workstation 2 columnas; sin rail derecho. */
  actionWorkspaceEnabled?: boolean;
}

const LEGACY_GRID =
  "xl:grid-cols-[minmax(220px,255px)_minmax(0,3fr)_minmax(300px,1.4fr)]";

const WORKSTATION_2COL =
  "xl:grid-cols-[minmax(260px,300px)_minmax(0,1fr)]";

/** Layout desktop del encounter (viewport ≥1280px / Tailwind `xl`). */
export function EncounterSplitLayout({
  rail,
  left,
  right,
  actionWorkspaceEnabled = false,
}: EncounterSplitLayoutProps) {
  return (
    <div
      className={cn(
        "clinical-encounter-grid hidden xl:grid xl:items-start xl:gap-hd-2",
        actionWorkspaceEnabled ? WORKSTATION_2COL : LEGACY_GRID,
      )}
      data-testid="encounter-split-layout"
      data-clinical-action-workspace={actionWorkspaceEnabled ? "true" : undefined}
      data-columns={actionWorkspaceEnabled ? "2" : "3"}
    >
      <ClinicalSurface depth={5} secondary className="min-w-0 shrink-0 p-hd-3">
        {rail}
      </ClinicalSurface>
      <ClinicalSurface
        depth={3}
        focusPrimary
        className="soap-command-center-shell clinical-focus-primary min-w-0 p-hd-2 shadow-hd-3 ring-1 ring-primary/10"
      >
        {left}
      </ClinicalSurface>
      {!actionWorkspaceEnabled && right ? (
        <ClinicalSurface depth={4} secondary className="min-w-0 p-hd-2">
          {right}
        </ClinicalSurface>
      ) : null}
    </div>
  );
}
