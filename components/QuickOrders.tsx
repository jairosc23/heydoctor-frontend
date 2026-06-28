"use client";

import { useState } from "react";

type QuickOrderType = "diagnostic" | "treatment" | "test" | "prescription";

type SelectedDiagnosis = {
  cie10CodeId: string;
  code: string;
  description: string;
};

type SelectedMedicationLine = {
  drugPresentationId: string;
  displayLabel: string;
};

interface QuickOrdersProps {
  onAddDiagnostic?: (item: SelectedDiagnosis) => void;
  onAddTreatment?: (name: string) => void;
  onOrderTest?: (name: string) => void;
  onCreatePrescription?: (items: SelectedMedicationLine[]) => void;
  hideDiagnosisTab?: boolean;
  defaultTab?: QuickOrderType;
  variant?: "default" | "secondary";
  className?: string;
}

export function QuickOrders({
  onAddDiagnostic,
  onAddTreatment,
  onOrderTest,
  onCreatePrescription,
  hideDiagnosisTab = false,
  defaultTab = "diagnostic",
  variant = "default",
  className = "",
}: QuickOrdersProps) {
  const [activeTab, setActiveTab] = useState<QuickOrderType>(
    hideDiagnosisTab && defaultTab === "diagnostic" ? "treatment" : defaultTab,
  );
  const [diagnosticInput, setDiagnosticInput] = useState("");
  const [treatmentInput, setTreatmentInput] = useState("");
  const [testInput, setTestInput] = useState("");
  const [prescriptionInput, setPrescriptionInput] = useState("");
  const [prescriptionItems, setPrescriptionItems] = useState<SelectedMedicationLine[]>([]);

  const tabs: { id: QuickOrderType; label: string }[] = [
    ...(hideDiagnosisTab ? [] : [{ id: "diagnostic" as const, label: "Diagnóstico" }]),
    { id: "treatment", label: "Tratamiento" },
    { id: "test", label: "Estudio" },
    { id: "prescription", label: "Receta" },
  ];

  const addDiagnostic = () => {
    const value = diagnosticInput.trim();
    if (!value) return;
    onAddDiagnostic?.({ cie10CodeId: "", code: value, description: value });
    setDiagnosticInput("");
  };

  const addTreatment = () => {
    const value = treatmentInput.trim();
    if (!value) return;
    onAddTreatment?.(value);
    setTreatmentInput("");
  };

  const addTest = () => {
    const value = testInput.trim();
    if (!value) return;
    onOrderTest?.(value);
    setTestInput("");
  };

  const addPrescriptionItem = () => {
    const value = prescriptionInput.trim();
    if (!value) return;
    const item = { drugPresentationId: value, displayLabel: value };
    setPrescriptionItems((prev) =>
      prev.some((existing) => existing.displayLabel === item.displayLabel)
        ? prev
        : [...prev, item],
    );
    setPrescriptionInput("");
  };

  const createPrescription = () => {
    if (prescriptionItems.length === 0) return;
    onCreatePrescription?.(prescriptionItems);
    setPrescriptionItems([]);
  };

  return (
    <div
      className={`rounded-lg border p-3 ${
        variant === "secondary" ? "border-slate-200 bg-slate-50/80" : "border-gray-200"
      } ${className}`}
    >
      <h3 className="mb-0.5 text-sm font-semibold text-gray-700">Órdenes rápidas</h3>
      {variant === "secondary" ? (
        <p className="mb-2 text-xs text-slate-500">
          Alternativa manual; el plan unificado es el punto de entrada preferido.
        </p>
      ) : null}

      <div
        className="mb-3 flex gap-1 overflow-x-auto"
        role="tablist"
        aria-label="Tipos de órdenes rápidas"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`min-h-[44px] whitespace-nowrap rounded px-2 py-1 text-xs ${
              activeTab === tab.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "diagnostic" && (
        <div className="flex gap-2">
          <input
            type="text"
            value={diagnosticInput}
            onChange={(event) => setDiagnosticInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && addDiagnostic()}
            aria-label="Diagnóstico rápido"
            placeholder="Diagnóstico..."
            className="min-h-[44px] flex-1 rounded border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={addDiagnostic}
            aria-label="Agregar diagnóstico rápido"
            className="min-h-[44px] rounded bg-indigo-600 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            +
          </button>
        </div>
      )}

      {activeTab === "treatment" && (
        <div className="flex gap-2">
          <input
            type="text"
            value={treatmentInput}
            onChange={(event) => setTreatmentInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && addTreatment()}
            aria-label="Tratamiento rápido"
            placeholder="Tratamiento..."
            className="min-h-[44px] flex-1 rounded border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={addTreatment}
            aria-label="Agregar tratamiento rápido"
            className="min-h-[44px] rounded bg-indigo-600 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            +
          </button>
        </div>
      )}

      {activeTab === "test" && (
        <div className="flex gap-2">
          <input
            type="text"
            value={testInput}
            onChange={(event) => setTestInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && addTest()}
            aria-label="Estudio rápido"
            placeholder="Ordenar estudio..."
            className="min-h-[44px] flex-1 rounded border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={addTest}
            aria-label="Agregar estudio rápido"
            className="min-h-[44px] rounded bg-indigo-600 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Ordenar
          </button>
        </div>
      )}

      {activeTab === "prescription" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={prescriptionInput}
              onChange={(event) => setPrescriptionInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addPrescriptionItem()}
              aria-label="Medicamento rápido"
              placeholder="Medicamento..."
              className="min-h-[44px] flex-1 rounded border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={addPrescriptionItem}
              aria-label="Agregar medicamento rápido"
              className="min-h-[44px] rounded bg-indigo-600 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              +
            </button>
          </div>
          {prescriptionItems.length > 0 && (
            <ul className="space-y-1 text-sm">
              {prescriptionItems.map((item) => (
                <li
                  key={item.drugPresentationId}
                  className="flex min-h-[44px] items-center justify-between"
                >
                  {item.displayLabel}
                  <button
                    type="button"
                    onClick={() =>
                      setPrescriptionItems((prev) =>
                        prev.filter((existing) => existing.drugPresentationId !== item.drugPresentationId),
                      )
                    }
                    className="min-h-[44px] min-w-[44px] rounded text-xs text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                    aria-label={`Quitar ${item.displayLabel}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={createPrescription}
            disabled={prescriptionItems.length === 0}
            className="min-h-[44px] w-full rounded bg-green-600 py-1.5 text-sm text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
          >
            Agregar a receta
          </button>
        </div>
      )}
    </div>
  );
}
