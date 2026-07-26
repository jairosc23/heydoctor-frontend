/**
 * PR-8 Wave M2 — Composer Intake types (mirrors BE clinical-assist contracts).
 * Composition State Ownership + State Transition: Composer-exclusive.
 */

export type ClinicalAssistSourceAssetType =
  | "therapeutic_asset"
  | "clinical_protocol"
  | "ai_assist";

export type ClinicalAssistMedication = {
  name: string;
  drugPresentationId?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  route?: string;
  instructions?: string;
};

export type ProtocolAssistanceProvenance = {
  kind: "protocol_assisted_composition";
  protocolId: string;
  protocolVersionId: string;
  protocolVersionNumber: number;
  contentHash: string;
  actorDoctorId: string;
  clinicId: string;
  occurredAt: string;
  assistanceApiVersion: "pr8-pacp-v1";
};

export type TherapeuticAssistanceProvenance = {
  kind: "therapeutic_assisted_composition";
  assetId: string;
  revisionId: string;
  actorDoctorId: string;
  clinicId: string;
  occurredAt: string;
  assistanceApiVersion: "pr8-pacp-v1";
};

export type AiAssistanceProvenance = {
  kind: "ai_assisted_composition";
  artifactId: string;
  snapshotId: string;
  actorDoctorId: string;
  clinicId: string;
  occurredAt: string;
  assistanceApiVersion: "pr8-pacp-v1";
};

export type AssistanceProvenance =
  | ProtocolAssistanceProvenance
  | TherapeuticAssistanceProvenance
  | AiAssistanceProvenance;

export type AssistanceContext = {
  evaluated: false;
  cie10Hints: string[];
  ruleRefs: Array<{ ruleId: string; revisionId?: string | null }>;
  evidenceRefs: Array<{ evidenceId: string }>;
  guidelineRefs: Array<{ guidelineId: string }>;
  tkSoftRefs: Array<{ tkAssetId: string }>;
  omittedMedicationLines: Array<{ index: number; reason: "missing_narrative" }>;
};

export type ClinicalAssistPrefillDraft = {
  sourceAssetType: ClinicalAssistSourceAssetType;
  sourceAssetId: string;
  sourceRevisionId: string;
  cie10CodeId?: string | null;
  diagnosis?: string | null;
  medications: ClinicalAssistMedication[];
  notes?: string | null;
  therapeuticIntent?: string | null;
  tags?: string[];
  assistanceProvenance: AssistanceProvenance;
  assistanceContext?: AssistanceContext;
};

/** No physicianEdited here — T6 SoT is CompositionState.physicianEdited */
export type AssistanceSession = {
  sourceAssetType: ClinicalAssistSourceAssetType;
  sourceAssetId: string;
  sourceRevisionId: string;
  assistanceProvenance: AssistanceProvenance;
  assistanceContext: AssistanceContext;
  receivedAt: string;
};

export type IntakeSession = {
  intakeSessionId: string;
  receivedAt: string;
  sourceAssetType: ClinicalAssistSourceAssetType;
  sourceAssetId: string;
  sourceRevisionId: string;
  hydratedClinical: {
    cie10CodeId?: string | null;
    diagnosis?: string | null;
    medications: ClinicalAssistMedication[];
    notes?: string | null;
    therapeuticIntent?: string | null;
    tags?: string[];
  };
  assistanceSession: AssistanceSession;
};

/** Composer State Transition Principle */
export type ComposerLifecycleState =
  | "EMPTY"
  | "HYDRATED"
  | "EDITED"
  | "CONFIRMED"
  | "EMITTED";

export type CompositionState = {
  lifecycle: ComposerLifecycleState;
  patientId: string;
  consultationId?: string | null;
  cie10CodeId?: string | null;
  diagnosis?: string | null;
  medications: ClinicalAssistMedication[];
  notes?: string | null;
  therapeuticIntent?: string | null;
  tags?: string[];
  assistanceSession?: AssistanceSession;
  intakeSessionId: string;
  /** T6 — single source of truth */
  physicianEdited: boolean;
  updatedAt: string;
};

export type IntakeContext = {
  actorDoctorId: string;
  clinicId: string;
  patientId: string;
  consultationId?: string | null;
  replaceExistingAssist?: boolean;
};

export type TherapeuticPrefillDraftLike = {
  sourceAssetType: string;
  sourceAssetId: string;
  sourceRevisionId: string;
  cie10CodeId?: string | null;
  diagnosis?: string | null;
  medications: ClinicalAssistMedication[];
  notes?: string | null;
  therapeuticIntent?: string | null;
  tags?: string[];
};

export function emptyAssistanceContext(): AssistanceContext {
  return {
    evaluated: false,
    cie10Hints: [],
    ruleRefs: [],
    evidenceRefs: [],
    guidelineRefs: [],
    tkSoftRefs: [],
    omittedMedicationLines: [],
  };
}
