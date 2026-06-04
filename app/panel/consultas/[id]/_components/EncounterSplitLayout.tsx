"use client";

import type { ReactNode } from "react";

export interface EncounterSplitLayoutProps {
  rail: ReactNode;
  left: ReactNode;
  right: ReactNode;
}

/**
 * Shell desktop del encounter (≥1280px). Fase 5 conectará paneles reales y el rail de paciente.
 */
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

export function EncounterRailPlaceholder() {
  return (
    <aside
      role="complementary"
      aria-label="Contexto del paciente (vista escritorio)"
      className="sticky top-20 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Rail de paciente
      </p>
      <p className="mt-2 leading-relaxed">
        Placeholder del contexto clínico en columna desktop. Se integrará con{" "}
        <span className="font-medium">PatientContextRail</span> en Fase 5.
      </p>
    </aside>
  );
}
