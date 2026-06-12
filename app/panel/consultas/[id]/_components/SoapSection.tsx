"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  DiagnosisBadge,
  LiveAiNoteSuggestions,
  SmartDiagnosisPicker,
} from "@/components/clinical";
import {
  getDiagnosisBadgeVariant,
  type DiagnosisSource,
} from "@/lib/services/consultation-diagnosis";
import { AutosaveIndicator } from "./AutosaveIndicator";
import type { AutosaveStatus } from "@/lib/hooks/useConsultationAutosave";
import { UnifiedClinicalActionBar } from "@/components/clinical/UnifiedClinicalActionBar";

export interface SoapSectionProps {
  consultationId: string;
  clinicId: string | null;
  editable: boolean;
  diagnosis: string;
  diagnosisCode?: string | null;
  diagnosisDescription?: string | null;
  diagnosisSource?: DiagnosisSource;
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
  diagnosisCode,
  diagnosisDescription,
  diagnosisSource = "empty",
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
  const badgeVariant = getDiagnosisBadgeVariant(diagnosisSource);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-900">Nota clínica</h2>
        {editable ? (
          <AutosaveIndicator
            status={autosaveStatus}
            lastSavedAt={lastSavedAt}
            errorMessage={autosaveError}
          />
        ) : (
          <p className="text-xs text-slate-500">Solo lectura</p>
        )}
      </div>

      <section className="space-y-2 border-b border-slate-100 pb-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Diagnóstico
        </h3>
        {(diagnosisCode || diagnosisDescription) && badgeVariant ? (
          <DiagnosisBadge
            code={diagnosisCode}
            description={diagnosisDescription}
            variant={badgeVariant}
            className="mb-2"
          />
        ) : null}
        <SmartDiagnosisPicker
          value={diagnosis}
          onChange={() => {
            /* persistencia atómica vía onConfirm + autosave unificado */
          }}
          onConfirm={onDiagnosisConfirm}
          clinicId={clinicId}
        />
        {diagnosisError ? (
          <p
            role="alert"
            className="mt-1 rounded border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-700"
          >
            {diagnosisError}
          </p>
        ) : null}
      </section>

      <UnifiedClinicalActionBar />

      <section className="space-y-2 border-b border-slate-100 pb-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
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
      </section>

      <section className="space-y-2">
        <label
          htmlFor="soap-treatment"
          className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
        >
          Tratamiento / plan
        </label>
        <textarea
          id="soap-treatment"
          value={treatment}
          onChange={(e) => onTreatmentChange(e.target.value)}
          disabled={!editable}
          rows={5}
          placeholder="Indicaciones, medicación, seguimiento…"
          className="w-full resize-y rounded-md border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50"
        />
      </section>
    </div>
  );
}
