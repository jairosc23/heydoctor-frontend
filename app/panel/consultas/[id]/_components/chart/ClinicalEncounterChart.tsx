"use client";

import { useState, type ReactNode, type Ref } from "react";
import { DISCLOSURE_RAIL_LABEL } from "../clinical-navigation-rail-model";
import { EncounterDisclosureMount } from "../EncounterDisclosureMount";
import { EncounterCopilotCicStrip } from "../copilot/EncounterCopilotCicStrip";
import type { ClinicalVitalSigns } from "@/lib/clinical-vital-signs-context";
import type { PhysicalExam } from "@/lib/physical-exam-framework";
import type { DiagnosisSource } from "@/lib/services/consultation-diagnosis";
import type { AutosaveStatus } from "@/lib/hooks/useConsultationAutosave";
import type { PatientProfile, PatientRow } from "@/lib/services/patients";
import type { PatientClinicalMemory } from "@/lib/types/clinical-memory";
import { cn } from "@/lib/utils";
import { AutosaveIndicator } from "../AutosaveIndicator";
import { ActiveProblemsSection } from "./ActiveProblemsSection";
import { AnamnesisSection } from "./AnamnesisSection";
import { DiagnosisSection } from "./DiagnosisSection";
import { PhysicalExamSection } from "./PhysicalExamSection";
import { ClinicalDocumentsSection } from "./ClinicalDocumentsSection";
import { ClinicalOrdersSection } from "./ClinicalOrdersSection";
import { ClinicalDecisionsSection } from "./ClinicalDecisionsSection";
import { ClinicalAuthoritySection } from "./ClinicalAuthoritySection";
import { ClinicalArtifactsSection } from "./ClinicalArtifactsSection";
import { LongitudinalClinicalRecordSection } from "./LongitudinalClinicalRecordSection";
import { ClinicalRuleEvaluationSection } from "./ClinicalRuleEvaluationSection";
import { ClinicalUnderstandingSection } from "./ClinicalUnderstandingSection";
import { ClinicalReasoningSection } from "./ClinicalReasoningSection";
import { ClinicalRecommendationSection } from "./ClinicalRecommendationSection";
import { ClinicalOutcomeSection } from "./ClinicalOutcomeSection";
import { ClinicalGovernanceSection } from "./ClinicalGovernanceSection";
import { HumanDecisionSection } from "./HumanDecisionSection";
import { ClinicalExecutionSection } from "./ClinicalExecutionSection";
import { ClinicalLearningSection } from "./ClinicalLearningSection";
import { ClinicalReentrySection } from "./ClinicalReentrySection";
import { ClinicalKnowledgeSection } from "./ClinicalKnowledgeSection";
import { ClinicalEvidenceSection } from "./ClinicalEvidenceSection";
import { ClinicalScientificGovernanceSection } from "./ClinicalScientificGovernanceSection";
import { ClinicalKnowledgeFederationSection } from "./ClinicalKnowledgeFederationSection";
import { ClinicalKnowledgeJurisdictionSection } from "./ClinicalKnowledgeJurisdictionSection";
import { ClinicalKnowledgeEngineSection } from "./ClinicalKnowledgeEngineSection";
import { ClinicalKnowledgeGroundingSection } from "./ClinicalKnowledgeGroundingSection";
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
  onAntecedentsDirtyChange?: (dirty: boolean) => void;
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
  /** Campos de la ficha editables (status + modo edición). */
  editable: boolean;
  /** El status de la consulta permite edición. */
  canToggleEdit?: boolean;
  /** Modo edición activo (editMode). */
  isEditing?: boolean;
  onToggleEdit?: () => void;
  antecedentsDirty?: boolean;
  autosaveStatus?: AutosaveStatus;
  lastSavedAt?: Date | null;
  autosaveError?: string | null;
  manualSaveStatus?: ManualSaveStatus;
  onManualSave?: () => void | Promise<void>;
  /** Mensaje breve post-Guardar (éxito o error). */
  saveFeedbackMessage?: string | null;
  headerExtra?: ReactNode;
  closure?: EncounterClosureSectionProps;
  longitudinal?: PatientLongitudinalProps;
  /** Open Full Clinical Record without leaving Encounter Runtime. */
  onOpenFullRecord?: () => void;
  /** UUID de la consulta para Documents, Orders, Decisions y Clinical Authority Spine. */
  consultationId?: string | null;
  className?: string;
  /** E2-2 chrome: constitutional previews stay mounted, collapsed by default. */
  disclosureExpanded?: boolean;
  onDisclosureExpandedChange?: (expanded: boolean) => void;
  /** E2-3: oferta clínica (Rx/lab/referral E1) between SOAP and HAB/firma. */
  afterSoap?: ReactNode;
  /** Context-aware CIC: offer panel currently expanded. */
  offerExpanded?: boolean;
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
  canToggleEdit = false,
  isEditing = false,
  onToggleEdit,
  antecedentsDirty = false,
  autosaveStatus,
  lastSavedAt,
  autosaveError,
  manualSaveStatus = "idle",
  onManualSave,
  saveFeedbackMessage = null,
  headerExtra,
  closure,
  longitudinal,
  onOpenFullRecord,
  consultationId = null,
  className,
  disclosureExpanded: disclosureExpandedProp,
  onDisclosureExpandedChange,
  afterSoap = null,
  offerExpanded = false,
}: ClinicalEncounterChartProps) {
  const [uncontrolledDisclosure, setUncontrolledDisclosure] = useState(false);
  const disclosureExpanded = disclosureExpandedProp ?? uncontrolledDisclosure;
  const setDisclosureExpanded = (next: boolean) => {
    if (disclosureExpandedProp === undefined) setUncontrolledDisclosure(next);
    onDisclosureExpandedChange?.(next);
  };
  const profileProps = {
    profile: longitudinal?.profile ?? null,
    loading: longitudinal?.loading,
    patientId: longitudinal?.patientId ?? patientId,
    editable: Boolean(longitudinal?.editable && editable),
    onProfileSaved: longitudinal?.onProfileSaved,
    onDraftKeyChange: longitudinal?.onAntecedentsDraftKeyChange,
    onDirtyChange: longitudinal?.onAntecedentsDirtyChange,
    onPersistError: longitudinal?.onAntecedentsPersistError,
  };

  const idleSaveLabel = antecedentsDirty
    ? "Cambios pendientes — Guardar consulta y antecedentes"
    : "Guardar";
  const manualSaveLabel =
    manualSaveStatus === "saving"
      ? "Guardando…"
      : manualSaveStatus === "saved"
        ? "Información guardada"
        : manualSaveStatus === "error"
          ? "Reintentar"
          : idleSaveLabel;
  const manualSaveDisabled =
    !editable || !onManualSave || manualSaveStatus === "saving";
  const lastSavedLabel = lastSavedAt
    ? lastSavedAt.toLocaleString("es-CL", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : null;

  const modeBadge = canToggleEdit
    ? isEditing
      ? "Editando la consulta"
      : "Solo lectura"
    : "Solo lectura";

  return (
    <div
      className={cn("space-y-hd-4", className)}
      data-testid="clinical-encounter-chart"
      aria-label="Ficha clínica médica integral"
    >
      <header className="mb-hd-4 space-y-hd-2 border-b border-hd-border-subtle pb-hd-3">
        <div className="flex flex-wrap items-center justify-between gap-hd-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
              HeyDoctor Clinical Encounter™
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              Ficha clínica
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex h-8 items-center rounded-hd-md border px-2.5 text-xs font-semibold",
                isEditing && canToggleEdit
                  ? "border-primary/30 bg-primaryLight/50 text-primary"
                  : "border-slate-200 bg-slate-50 text-slate-600",
              )}
              data-testid="encounter-edit-mode-badge"
            >
              {modeBadge}
            </span>
            {canToggleEdit && onToggleEdit ? (
              <button
                type="button"
                onClick={onToggleEdit}
                className="inline-flex h-8 items-center rounded-hd-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                data-testid="encounter-toggle-edit"
              >
                {isEditing ? "Cerrar edición" : "Editar consulta"}
              </button>
            ) : null}
            {headerExtra}
            <button
              type="button"
              onClick={() => void onManualSave?.()}
              disabled={manualSaveDisabled}
              aria-busy={manualSaveStatus === "saving"}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-hd-md border border-primary/20 bg-white px-3 text-xs font-semibold text-primary shadow-sm transition-colors hover:bg-primaryLight disabled:cursor-not-allowed disabled:opacity-60",
                antecedentsDirty &&
                  manualSaveStatus === "idle" &&
                  "border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100",
                manualSaveStatus === "saved" &&
                  "border-emerald-300 bg-emerald-50 text-emerald-800",
                manualSaveStatus === "error" &&
                  "border-red-300 bg-red-50 text-red-800 hover:bg-red-100",
              )}
              data-testid="encounter-manual-save"
            >
              {manualSaveStatus === "saving" ? (
                <span
                  className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
                  aria-hidden
                  data-testid="encounter-manual-save-spinner"
                />
              ) : null}
              {manualSaveStatus === "saved" ? <span aria-hidden>✓</span> : null}
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
        </div>
        {lastSavedLabel ? (
          <p
            className="text-[11px] text-slate-500"
            data-testid="encounter-last-saved"
          >
            Último guardado: {lastSavedLabel}
          </p>
        ) : null}
        {antecedentsDirty && editable && manualSaveStatus === "idle" ? (
          <p
            className="text-xs font-semibold text-amber-700"
            data-testid="encounter-antecedents-dirty-hint"
          >
            Cambios pendientes en antecedentes.
          </p>
        ) : null}
        {(manualSaveStatus === "saved" || manualSaveStatus === "error") &&
        saveFeedbackMessage ? (
          <div
            className={cn(
              "flex flex-wrap items-center justify-between gap-2 rounded-hd-md border px-hd-3 py-hd-2 text-xs font-medium",
              manualSaveStatus === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-900",
            )}
            data-testid="encounter-save-feedback"
            role={manualSaveStatus === "error" ? "alert" : "status"}
          >
            <p>{saveFeedbackMessage}</p>
            {manualSaveStatus === "error" && onManualSave ? (
              <button
                type="button"
                onClick={() => void onManualSave()}
                className="rounded-hd-md border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-800 hover:bg-red-100"
                data-testid="encounter-manual-save-retry"
              >
                Reintentar
              </button>
            ) : null}
          </div>
        ) : null}
        {!canToggleEdit ? (
          <p className="text-xs text-slate-500">
            Esta consulta no admite cambios en el estado actual.
          </p>
        ) : null}
      </header>

      <div className="space-y-hd-4" data-hot-path="true" data-testid="encounter-hot-path">
        <PatientIdentificationSection
          patient={longitudinal?.patient ?? null}
          loading={longitudinal?.loading}
          patientId={longitudinal?.patientId ?? patientId}
          onOpenFullRecord={onOpenFullRecord}
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
        <EncounterCopilotCicStrip
          consultationId={consultationId}
          chiefComplaint={diagnosis}
          subjective={presentIllnessHistory}
          plan={treatment}
          physicalExamDocumented={Object.entries(physicalExam).some(
            ([key, value]) =>
              key === "msk"
                ? Object.values(physicalExam.msk ?? {}).some((item) =>
                    String(item).trim(),
                  )
                : typeof value === "string" && value.trim().length > 0,
          )}
          antecedentsDocumented={Boolean(
            (clinicalMemory?.recentDiagnoses.length ?? 0) +
              (clinicalMemory?.currentMedications.length ?? 0),
          )}
          activeProblemCount={
            (clinicalMemory?.activeConditions.length ?? 0) +
            (encounterDiagnosis?.trim() ? 1 : 0)
          }
          offerExpanded={offerExpanded}
          onApplyToSubjective={onPresentIllnessHistoryChange}
          onApplyToPlan={onTreatmentChange}
          editable={editable}
        />
        {afterSoap}
        {closure ? <EncounterClosureSection {...closure} /> : null}
        </div>
        <div className="space-y-hd-2">
          <button
            type="button"
            data-testid="encounter-disclosure-toggle"
            aria-expanded={disclosureExpanded}
            aria-controls="encounter-disclosure-panel"
            onClick={() => setDisclosureExpanded(!disclosureExpanded)}
            className="clinical-interactive flex w-full items-center justify-between rounded-hd-md border border-hd-border-subtle bg-hd-surface-muted px-hd-3 py-hd-2 text-left text-xs font-medium text-slate-600"
          >
            <span>{DISCLOSURE_RAIL_LABEL}</span>
            <span className="text-[10px] text-slate-400">
              {disclosureExpanded ? "Ocultar" : "Mostrar"}
            </span>
          </button>
          <div
            id="encounter-disclosure-panel"
            data-testid="encounter-disclosure-panel"
            data-expanded={disclosureExpanded ? "true" : "false"}
            data-hot-path="false"
            hidden={!disclosureExpanded}
            className={disclosureExpanded ? "space-y-hd-4" : undefined}
          >
            <EncounterDisclosureMount expanded={disclosureExpanded}>
            <ClinicalDocumentsSection consultationId={consultationId} />
            <ClinicalOrdersSection consultationId={consultationId} />
            <ClinicalDecisionsSection consultationId={consultationId} />
            <ClinicalAuthoritySection consultationId={consultationId} />
            <ClinicalArtifactsSection consultationId={consultationId} />
            <LongitudinalClinicalRecordSection consultationId={consultationId} />
            <ClinicalRuleEvaluationSection consultationId={consultationId} />
            <ClinicalUnderstandingSection consultationId={consultationId} />
            <ClinicalReasoningSection consultationId={consultationId} />
            <ClinicalRecommendationSection consultationId={consultationId} />
            <ClinicalOutcomeSection consultationId={consultationId} />
            <ClinicalGovernanceSection consultationId={consultationId} />
            <HumanDecisionSection consultationId={consultationId} />
            <ClinicalExecutionSection consultationId={consultationId} />
            <ClinicalLearningSection consultationId={consultationId} />
            <ClinicalReentrySection consultationId={consultationId} />
            <ClinicalKnowledgeSection consultationId={consultationId} />
            <ClinicalEvidenceSection consultationId={consultationId} />
            <ClinicalScientificGovernanceSection consultationId={consultationId} />
            <ClinicalKnowledgeFederationSection consultationId={consultationId} />
            <ClinicalKnowledgeJurisdictionSection consultationId={consultationId} />
            <ClinicalKnowledgeEngineSection consultationId={consultationId} />
            <ClinicalKnowledgeGroundingSection consultationId={consultationId} />
            </EncounterDisclosureMount>
          </div>
        </div>
    </div>
  );
}
