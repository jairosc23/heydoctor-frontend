"use client";

/**
 * Public QA harness — real CatalogCombobox / PosologyFields / PosologyPreview.
 * Path /qa/* is not middleware-protected (unlike /dev).
 * Not a production clinical surface.
 */

import { useState } from "react";
import {
  PosologyFields,
  PosologyPreview,
} from "@/components/medication-order";
import type {
  MedicationProductRef,
  StructuredPosology,
} from "@/lib/medication-domain";

const INITIAL_POSOLOGY: StructuredPosology = {
  dose: null,
  frequency: null,
  duration: null,
  route: null,
  timingInstructions: [],
};

const PRODUCT: MedicationProductRef = {
  displayLabel: "Paracetamol 500 mg",
  strengthDisplay: "500 mg",
  jurisdictionCode: "CL",
};

export default function Pr1BuilderQaPage() {
  const [posology, setPosology] = useState<StructuredPosology>(INITIAL_POSOLOGY);
  const [doseFormCode, setDoseFormCode] = useState<string | null>(null);

  const product: MedicationProductRef = {
    ...PRODUCT,
    ...(doseFormCode ? { doseForm: doseFormCode } : {}),
  };

  return (
    <main
      className="min-h-screen bg-slate-100 px-4 py-8"
      data-testid="pr1-qa-harness"
    >
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="border-b border-slate-200 pb-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-800">
            HeyDoctor · QA PR-1
          </p>
          <h1 className="text-xl font-semibold text-slate-900">
            Prescription Builder · validación funcional
          </h1>
          <p className="text-sm text-slate-600">
            Componentes reales · catálogos CL · teclado ↑↓ Enter Esc
          </p>
        </header>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-teal-800">
            Línea terapéutica 1
          </p>
          <PosologyFields
            value={posology}
            onChange={setPosology}
            doseFormCode={doseFormCode}
            onDoseFormChange={setDoseFormCode}
            jurisdictionCode="CL"
            idPrefix="qa-posology"
          />
          <PosologyPreview
            product={product}
            posology={posology}
            jurisdictionCode="CL"
          />
        </section>
      </div>
    </main>
  );
}
