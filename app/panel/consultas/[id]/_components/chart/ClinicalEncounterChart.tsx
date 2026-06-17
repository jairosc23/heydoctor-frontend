"use client";

import type { ReactNode } from "react";
import type { ClinicalVitalSigns } from "@/lib/clinical-vital-signs-context";
import type { PhysicalExam } from "@/lib/physical-exam-framework";
import type { DiagnosisSource } from "@/lib/services/consultation-diagnosis";
import type { AutosaveStatus } from "@/lib/hooks/useConsultationAutosave";
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
  editable: boolean;
  autosaveStatus?: AutosaveStatus;
  lastSavedAt?: Date | null;
  autosaveError?: string | null;
  headerExtra?: ReactNode;
  closure?: EncounterClosureSectionProps;
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
  editable,
  autosaveStatus,
  lastSavedAt,
  autosaveError,
  headerExtra,
  closure,
  className,
}: ClinicalEncounterChartProps) {
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
