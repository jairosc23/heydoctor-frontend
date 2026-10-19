/**
 * Contrato HTTP del Clinical Execution (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_EXECUTION_TYPES = [
  "therapeutic_execution",
  "investigation_execution",
  "precaution_execution",
] as const;

export type ClinicalExecutionType = (typeof CLINICAL_EXECUTION_TYPES)[number];

export type ClinicalExecutionGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalExecutionGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalExecutionGateIssue[] };

export type ClinicalExecutionDecisionCitation = {
  decisionId: string;
  decisionType?: string | null;
  disposition?: string | null;
};

export type ClinicalExecutionSourceRefs = {
  decisions: ClinicalExecutionDecisionCitation[];
};

export type ClinicalExecutionHttpView = {
  id: string;
  executionType: string;
  title: string;
  description: string;
  status: string;
  progression: string;
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
    decisions?: ClinicalExecutionDecisionCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; decisionConstituted: true };
  sourceRefs: ClinicalExecutionSourceRefs;
  executionSetId: null;
  progressedAt: string | Date;
  executionChannel: "clinical_execution";
  supportsPreview: boolean;
  supportsExecution: boolean;
  supportsDiagnosis: false;
  supportsDecision: false;
  supportsGovernance: false;
  supportsAuthorization: false;
  supportsEmission: false;
  immutable: true;
  inClinicalExecutionScope: boolean;
};

export type ClinicalExecutionViewProjectionResult =
  | { ok: true; view: ClinicalExecutionHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalExecutionHttpCapability = {
  executionType: string;
  title: string;
  supportsPreview: boolean;
  supportsExecution: boolean;
  supportsDiagnosis: false;
  supportsDecision: false;
  supportsGovernance: false;
  supportsAuthorization: false;
  supportsEmission: false;
  immutable: true;
  inClinicalExecutionScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalExecutionPreviewResponse = {
  data: {
    executionType: ClinicalExecutionType | string;
    consultationId: string;
    view: ClinicalExecutionViewProjectionResult;
    gate: ClinicalExecutionGateResult;
    capability: ClinicalExecutionHttpCapability;
  };
};
