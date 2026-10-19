/**
 * Contrato HTTP del Clinical Learning (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_LEARNING_TYPES = [
  "therapeutic_learning",
  "investigation_learning",
  "precaution_learning",
] as const;

export type ClinicalLearningType = (typeof CLINICAL_LEARNING_TYPES)[number];

export type ClinicalLearningGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalLearningGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalLearningGateIssue[] };

export type ClinicalLearningExecutionCitation = {
  executionId: string;
  executionType?: string | null;
  progression?: string | null;
};

export type ClinicalLearningSourceRefs = {
  executions: ClinicalLearningExecutionCitation[];
};

export type ClinicalLearningHttpView = {
  id: string;
  learningType: string;
  title: string;
  description: string;
  status: string;
  learningReturn: string;
  countryCode: string;
  locale: string;
  consultationId: string | null;
  clinic: { id?: string; name: string; countryCode: string };
  doctor: {
    id?: string;
    name: string;
    specialty?: string | null;
    licenseNumber?: string | null;
  };
  patient: {
    id?: string;
    name: string;
    documentNumber?: string | null;
  };
  payload: {
    kind: string;
    executions?: ClinicalLearningExecutionCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; executionConstituted: true };
  sourceRefs: ClinicalLearningSourceRefs;
  learningSetId: null;
  learnedAt: string | Date;
  learningChannel: "clinical_learning";
  supportsPreview: boolean;
  supportsLearning: boolean;
  supportsDiagnosis: false;
  supportsDecision: false;
  supportsGovernance: false;
  supportsAuthorization: false;
  supportsExecution: false;
  supportsEmission: false;
  immutable: true;
  inClinicalLearningScope: boolean;
};

export type ClinicalLearningViewProjectionResult =
  | { ok: true; view: ClinicalLearningHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalLearningHttpCapability = {
  learningType: string;
  title: string;
  supportsPreview: boolean;
  supportsLearning: boolean;
  supportsDiagnosis: false;
  supportsDecision: false;
  supportsGovernance: false;
  supportsAuthorization: false;
  supportsExecution: false;
  supportsEmission: false;
  immutable: true;
  inClinicalLearningScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalLearningPreviewResponse = {
  data: {
    learningType: ClinicalLearningType | string;
    consultationId: string;
    view: ClinicalLearningViewProjectionResult;
    gate: ClinicalLearningGateResult;
    capability: ClinicalLearningHttpCapability;
  };
};
