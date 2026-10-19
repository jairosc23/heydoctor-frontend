/**
 * Contrato HTTP del Clinical Reasoning (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_REASONING_TYPES = [
  "hypothesis_reasoning",
  "evidence_reasoning",
  "risk_reasoning",
] as const;

export type ClinicalReasoningType = (typeof CLINICAL_REASONING_TYPES)[number];

export type ClinicalReasoningGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalReasoningGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalReasoningGateIssue[] };

export type ClinicalReasoningUnderstandingCitation = {
  understandingId: string;
  understandingType?: string | null;
};

export type ClinicalReasoningSourceRefs = {
  understandings: ClinicalReasoningUnderstandingCitation[];
};

export type ClinicalReasoningHttpView = {
  id: string;
  reasoningType: string;
  title: string;
  description: string;
  status: string;
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
    understandings?: ClinicalReasoningUnderstandingCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; understandingAssembled: true };
  sourceRefs: ClinicalReasoningSourceRefs;
  reasoningSetId: null;
  reasonedAt: string | Date;
  reasoningChannel: "clinical_reasoning";
  supportsPreview: boolean;
  supportsReasoning: boolean;
  supportsDiagnosis: false;
  supportsRecommendation: false;
  immutable: true;
  inClinicalReasoningScope: boolean;
};

export type ClinicalReasoningViewProjectionResult =
  | { ok: true; view: ClinicalReasoningHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalReasoningHttpCapability = {
  reasoningType: string;
  title: string;
  supportsPreview: boolean;
  supportsReasoning: boolean;
  supportsDiagnosis: false;
  supportsRecommendation: false;
  immutable: true;
  inClinicalReasoningScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalReasoningPreviewResponse = {
  data: {
    reasoningType: ClinicalReasoningType | string;
    consultationId: string;
    view: ClinicalReasoningViewProjectionResult;
    gate: ClinicalReasoningGateResult;
    capability: ClinicalReasoningHttpCapability;
  };
};
