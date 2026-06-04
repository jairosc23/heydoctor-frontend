"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type EncounterLeftPaneTab = "soap" | "record" | "assist";

const LEFT_TABS: { id: EncounterLeftPaneTab; label: string }[] = [
  { id: "soap", label: "Nota (SOAP)" },
  { id: "record", label: "Ficha" },
  { id: "assist", label: "Asistencia" },
];

const PLACEHOLDER_COPY: Record<EncounterLeftPaneTab, string> = {
  soap: "Nota SOAP, diagnóstico y plan de tratamiento.",
  record: "Ficha clínica estructurada (HD_CR_V1).",
  assist: "Asistencia IA, insights y chat de consulta.",
};

export function EncounterLeftPane() {
  const [activeTab, setActiveTab] = useState<EncounterLeftPaneTab>("soap");

  return (
    <section
      aria-label="Documentación clínica"
      className="min-w-0 space-y-4"
      data-testid="encounter-left-pane"
    >
      <div
        className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1"
        role="tablist"
        aria-label="Sección clínica"
      >
        {LEFT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              activeTab === tab.id
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-slate-50",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        className="rounded-xl border border-dashed border-slate-300 bg-white p-6"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Placeholder — columna izquierda
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {PLACEHOLDER_COPY[activeTab]}
        </p>
        <p className="mt-3 text-xs text-slate-400">
          Conexión a paneles reales en Fase 5.
        </p>
      </div>
    </section>
  );
}
