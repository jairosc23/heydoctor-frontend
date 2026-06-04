"use client";

import type { Dispatch, SetStateAction } from "react";
import Card from "@/components/ui/Card";
import {
  LiveAiNoteSuggestions,
  SmartDiagnosisPicker,
} from "@/components/clinical";
import { AutosaveIndicator } from "./AutosaveIndicator";
import type { AutosaveStatus } from "@/lib/hooks/useConsultationAutosave";

export interface SoapSectionProps {
  consultationId: string;
  clinicId: string | null;
  editable: boolean;
  diagnosis: string;
  onDiagnosisChange: (text: string) => void;
  onDiagnosisConfirm: (item: {
    code: string;
    description: string;
    cie10CodeId?: string;
  }) => void | Promise<void>;
  diagnosisError: string | null;
  notes: string;
  setNotes: Dispatch<SetStateAction<string>>;
  treatment: string;
  onTreatmentChange: (value: string) => void;
  autosaveStatus: AutosaveStatus;
  lastSavedAt: Date | null;
  autosaveError: string | null;
}

export function SoapSection({
  consultationId,
  clinicId,
  editable,
  diagnosis,
  onDiagnosisChange,
  onDiagnosisConfirm,
  diagnosisError,
  notes,
  setNotes,
  treatment,
  onTreatmentChange,
  autosaveStatus,
  lastSavedAt,
  autosaveError,
}: SoapSectionProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-800">Nota clínica (SOAP)</h2>
        {editable ? (
          <AutosaveIndicator
            status={autosaveStatus}
            lastSavedAt={lastSavedAt}
            errorMessage={autosaveError}
          />
        ) : (
          <p className="text-sm text-slate-500">Solo lectura</p>
        )}
      </div>

      <Card className="p-5 shadow-soft">
        <h3 className="mb-3 text-base font-semibold text-slate-800">Diagnóstico</h3>
        <SmartDiagnosisPicker
          value={diagnosis}
          onChange={(item) =>
            onDiagnosisChange(`${item.code} - ${item.description}`)
          }
          onConfirm={onDiagnosisConfirm}
          clinicId={clinicId}
        />
        {diagnosisError ? (
          <p
            role="alert"
            className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {diagnosisError}
          </p>
        ) : null}
      </Card>

      <Card className="p-5 shadow-soft">
        <h3 className="mb-3 text-base font-semibold text-slate-800">
          Notas de consulta
        </h3>
        <LiveAiNoteSuggestions
          consultationId={consultationId}
          notes={notes}
          setNotes={setNotes}
          diagnosisContext={diagnosis}
          patientAge={undefined}
          patientSex={undefined}
        />
      </Card>

      <Card className="p-5 shadow-soft">
        <label
          htmlFor="soap-treatment"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Tratamiento / plan
        </label>
        <textarea
          id="soap-treatment"
          value={treatment}
          onChange={(e) => onTreatmentChange(e.target.value)}
          disabled={!editable}
          rows={4}
          placeholder="Indicaciones, medicación, seguimiento…"
          className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
        />
      </Card>
    </div>
  );
}
