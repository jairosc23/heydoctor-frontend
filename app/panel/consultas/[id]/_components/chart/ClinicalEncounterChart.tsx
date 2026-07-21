"use client";

import type { ReactNode, Ref } from "react";
import type { ClinicalVitalSigns } from "@/lib/clinical-vital-signs-context";
import type { PhysicalExam } from "@/lib/physical-exam-framework";
import type { DiagnosisSource } from "@/lib/services/consultation-diagnosis";
import type { AutosaveStatus } from "@/lib/hooks/useConsultationAutosave";
import type { PatientProfile, PatientRow } from "@/lib/services/patients";
import type { PatientClinicalMemory } from "@/lib/types/clinical-memory";
import { AutosaveIndicator } from "../AutosaveIndicator";
import { ActiveProblemsSection } from "./ActiveProblemsSection";
import { AnamnesisSection } from "./AnamnesisSection";
import { DiagnosisSection } from "./DiagnosisSection";
import { PhysicalExamSection } from "./PhysicalExamSection";
import { TreatmentSection } from "./TreatmentSection";
import { VitalSignsSection } from "./VitalSignsSection";
import {
  EncounterClosureSection,
  type EncounterClosureSectionProps,
} from "./EncounterClosureSection";
import { PatientIdentificationSection } from "./PatientIdentificationSection";
import {
  PatientAntecedentsSection,
  type PatientAntecedentsSectionHandle,
} from "./PatientLongitudinalSections";

export type ManualSaveStatus = "idle" | "saving" | "saved" | "error";

export interface PatientLongitudinalProps {
  patient: PatientRow | null;
  profile: PatientProfile | null;
  loading?: boolean;
  patientId?: string | null;
  editable?: boolean;
  antecedentsRef?: Ref<PatientAntecedentsSectionHandle>;
  onProfileSaved?: (profile: PatientProfile) => void;
  onAntecedentsDraftKeyChange?: (draftKey: string) => void;
  onAntecedentsPersistError?: (message: string) => void;
}

export interface ClinicalEncounterChartProps {
  vitals: ClinicalVitalSigns;
  onVitalsChange: (vitals: ClinicalVitalSigns) => void;
  physicalExam: PhysicalExam;
  onPhysicalExamChange: (exam: PhysicalExam) => void;
  presentIllnessHistory: string;
  onPresentIllnessHistoryChange: (value: string) => void;
  treatment: string;
  onTreatmentChange: (value: string) => void;
  clinicId: string | null;
  diagnosis: string;
  diagnosisCode?: string | null;
  diagnosisDescription?: string | null;
  diagnosisSource?: DiagnosisSource;
  diagnosisError: string | null;
  onDiagnosisConfirm: (item: {
    code: string;
    description: string;
    cie10CodeId?: string;
  }) => void | Promise<void>;
  patientId?: string | null;
  encounterDiagnosis?: string | null;
  allergyLines?: string[];
  clinicalMemory?: PatientClinicalMemory;
  clinicalMemoryLoading?: boolean;
  clinicalMemoryError?: string | null;
  editable: boolean;
  autosaveStatus?: AutosaveStatus;
  lastSavedAt?: Date | null;
  autosaveError?: string | null;
  manualSaveStatus?: ManualSaveStatus;
  onManualSave?: () => void | Promise<void>;
  headerExtra?: ReactNode;
  closure?: EncounterClosureSectionProps;
  longitudinal?: PatientLongitudinalProps;
  className?: string;
}

export function ClinicalEncounterChart({
  vitals,
  onVitalsChange,
  physicalExam,
  onPhysicalExamChange,
  presentIllnessHistory,
  onPresentIllnessHistoryChange,
  treatment,
  onTreatmentChange,
  clinicId,
  diagnosis,
  diagnosisCode,
  diagnosisDescription,
  diagnosisSource,
  diagnosisError,
  onDiagnosisConfirm,
  patientId,
  encounterDiagnosis,
  allergyLines,
  clinicalMemory,
  clinicalMemoryLoading,
  clinicalMemoryError,
  editable,
  autosaveStatus,
  lastSavedAt,
  autosaveError,
  manualSaveStatus = "idle",
  onManualSave,
  headerExtra,
  closure,
  longitudinal,
  className,
}: ClinicalEncounterChartProps) {
  const profileProps = {
    profile: longitudinal?.profile ?? null,
    loading: longitudinal?.loading,
    patientId: longitudinal?.patientId ?? patientId,
    editable: Boolean(longitudinal?.editable && editable),
    onProfileSaved: longitudinal?.onProfileSaved,
    onDraftKeyChange: longitudinal?.onAntecedentsDraftKeyChange,
    onPersistError: longitudinal?.onAntecedentsPersistError,
  };
  const manualSaveLabel =
    manualSaveStatus === "saving"
      ? "Guardando..."
      : manualSaveStatus === "saved"
        ? "Guardado ✓"
        : manualSaveStatus === "error"
          ? "Error"
          : "Guardar";
  const manualSaveDisabled =
    !editable || !onManualSave || manualSaveStatus === "saving";

  return (
    <div
      className={className}
      data-testid="clinical-encounter-chart"
      aria-label="Ficha clínica médica integral"
    >
      <header className="mb-hd-4 flex flex-wrap items-center justify-between gap-hd-2 border-b border-hd-border-subtle pb-hd-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
            HeyDoctor Clinical Encounter™
          </p>
          <h2 className="text-lg font-semibold text-slate-900">Ficha clínica</h2>
        </div>
        <div className="flex items-center gap-2">
          {headerExtra}
          <button
            type="button"
            onClick={() => void onManualSave?.()}
            disabled={manualSaveDisabled}
            className="inline-flex h-8 items-center rounded-hd-md border border-primary/20 bg-white px-3 text-xs font-semibold text-primary shadow-sm transition-colors hover:bg-primaryLight disabled:cursor-not-allowed disabled:opacity-60"
            data-testid="encounter-manual-save"
          >
            {manualSaveLabel}
          </button>
          {editable && autosaveStatus ? (
            <AutosaveIndicator
              status={autosaveStatus}
              lastSavedAt={lastSavedAt ?? null}
              errorMessage={autosaveError ?? null}
            />
          ) : null}
        </div>
      </header>

      <div className="space-y-hd-4">
        <PatientIdentificationSection
          patient={longitudinal?.patient ?? null}
          loading={longitudinal?.loading}
          patientId={longitudinal?.patientId ?? patientId}
        />
        <PatientAntecedentsSection
          ref={longitudinal?.antecedentsRef}
          {...profileProps}
        />
        <AnamnesisSection
          value={presentIllnessHistory}
          onChange={onPresentIllnessHistoryChange}
          editable={editable}
        />
        <VitalSignsSection
          vitals={vitals}
          onChange={onVitalsChange}
          editable={editable}
        />
        <PhysicalExamSection
          exam={physicalExam}
          onChange={onPhysicalExamChange}
          editable={editable}
        />
        <DiagnosisSection
          clinicId={clinicId}
          diagnosis={diagnosis}
          diagnosisCode={diagnosisCode}
          diagnosisDescription={diagnosisDescription}
          diagnosisSource={diagnosisSource}
          diagnosisError={diagnosisError}
          onDiagnosisConfirm={onDiagnosisConfirm}
          editable={editable}
        />
        <ActiveProblemsSection
          patientId={patientId}
          encounterDiagnosis={encounterDiagnosis}
          allergyLines={allergyLines}
          clinicalMemory={clinicalMemory}
          clinicalMemoryLoading={clinicalMemoryLoading}
          clinicalMemoryError={clinicalMemoryError}
        />
        <TreatmentSection
          value={treatment}
          onChange={onTreatmentChange}
          editable={editable}
        />
        {closure ? <EncounterClosureSection {...closure} /> : null}
      </div>
    </div>
  );
}
