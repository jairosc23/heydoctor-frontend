"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type EncounterRightPaneTab = "orders" | "documents";

const RIGHT_TABS: { id: EncounterRightPaneTab; label: string }[] = [
  { id: "orders", label: "Órdenes" },
  { id: "documents", label: "Documentos" },
];

const PLACEHOLDER_COPY: Record<EncounterRightPaneTab, string> = {
  orders: "Prescripciones, laboratorio, derivaciones y facturas.",
  documents: "PDF de consulta, recetas firmadas y documentos clínicos.",
};

export function EncounterRightPane() {
  const [activeTab, setActiveTab] = useState<EncounterRightPaneTab>("orders");

  return (
    <section
      aria-label="Órdenes y documentos"
      className="min-w-0 space-y-4"
      data-testid="encounter-right-pane"
    >
      <div
        className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1"
        role="tablist"
        aria-label="Gestión clínica"
      >
        {RIGHT_TABS.map((tab) => (
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
          Placeholder — columna derecha
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
