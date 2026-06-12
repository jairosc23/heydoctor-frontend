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
import { SoapCommandBlock } from "./SoapCommandBlock";

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
    <div className="soap-command-center space-y-hd-4">
      <header className="flex flex-wrap items-center justify-between gap-hd-2 border-b border-hd-border-subtle pb-hd-3">
        <div className="heydoctor-presence">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
            SOAP Command Center™
          </p>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Nota clínica
          </h2>
          <p className="text-[11px] text-slate-500">
            Centro de gravedad del encuentro
          </p>
        </div>
        {editable ? (
          <AutosaveIndicator
            status={autosaveStatus}
            lastSavedAt={lastSavedAt}
            errorMessage={autosaveError}
          />
        ) : (
          <p className="text-xs text-slate-500">Solo lectura</p>
        )}
      </header>

      <SoapCommandBlock step={1} title="Diagnóstico" priority="primary">
        {(diagnosisCode || diagnosisDescription) && badgeVariant ? (
          <DiagnosisBadge
            code={diagnosisCode}
            description={diagnosisDescription}
            variant={badgeVariant}
            className="mb-hd-2"
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
            className="clinical-status clinical-status--critical mt-hd-2 rounded-hd-md border px-hd-2 py-hd-2 text-xs"
          >
            {diagnosisError}
          </p>
        ) : null}
      </SoapCommandBlock>

      <SoapCommandBlock step={2} title="Plan clínico">
        <UnifiedClinicalActionBar />
      </SoapCommandBlock>

      <SoapCommandBlock step={3} title="Notas de consulta">
        <LiveAiNoteSuggestions
          consultationId={consultationId}
          notes={notes}
          setNotes={setNotes}
          diagnosisContext={diagnosis}
          patientAge={undefined}
          patientSex={undefined}
        />
      </SoapCommandBlock>

      <SoapCommandBlock step={4} title="Tratamiento / plan">
        <label htmlFor="soap-treatment" className="sr-only">
          Tratamiento / plan
        </label>
        <textarea
          id="soap-treatment"
          value={treatment}
          onChange={(e) => onTreatmentChange(e.target.value)}
          disabled={!editable}
          rows={5}
          placeholder="Indicaciones, medicación, seguimiento…"
          className="clinical-interactive w-full resize-y rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised px-hd-3 py-hd-2 text-sm shadow-hd-1 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:bg-slate-50"
        />
      </SoapCommandBlock>
    </div>
  );
}
