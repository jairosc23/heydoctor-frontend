"use client";

/**
 * Visual QA harness for Prescription Builder UX (PR-1).
 * Not a production clinical surface — /dev only.
 */

import { useMemo, useState } from "react";
import {
  MedicationOrderBuilder,
} from "@/components/medication-order";
import {
  emptyMedicationOrderLine,
  type MedicationOrderLine,
} from "@/lib/medication-domain";

export default function MedicationOrderBuilderDevPage() {
  const [lines, setLines] = useState<MedicationOrderLine[]>(() => [
    emptyMedicationOrderLine("line-1", "CL"),
  ]);
  const [diagnosis, setDiagnosis] = useState("J06.9");
  const [notes, setNotes] = useState("");

  const patientId = useMemo(() => "dev-patient", []);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-4">
        <header>
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-800">
            HeyDoctor · Dev
          </p>
          <h1 className="text-xl font-semibold text-slate-900">
            Medication Order Builder · UX Preview
          </h1>
          <p className="text-sm text-slate-600">
            Catálogos CL · combobox enterprise · teclado ↑↓ Enter Esc
          </p>
        </header>
        <MedicationOrderBuilder
          lines={lines}
          onChange={setLines}
          patientId={patientId}
          diagnosis={diagnosis}
          onDiagnosisChange={setDiagnosis}
          notes={notes}
          onNotesChange={setNotes}
          onSave={() => undefined}
        />
      </div>
    </main>
  );
}
