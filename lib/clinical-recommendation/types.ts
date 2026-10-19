/**
 * Contrato HTTP del Clinical Recommendation (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_RECOMMENDATION_TYPES = [
  "therapeutic_recommendation",
  "investigation_recommendation",
  "precaution_recommendation",
] as const;

export type ClinicalRecommendationType =
  (typeof CLINICAL_RECOMMENDATION_TYPES)[number];

export type ClinicalRecommendationGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalRecommendationGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalRecommendationGateIssue[] };

export type ClinicalRecommendationReasoningCitation = {
  reasoningId: string;
  reasoningType?: string | null;
};

export type ClinicalRecommendationSourceRefs = {
  reasonings: ClinicalRecommendationReasoningCitation[];
};

export type ClinicalRecommendationHttpView = {
  id: string;
  recommendationType: string;
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
    reasonings?: ClinicalRecommendationReasoningCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; reasoningReasoned: true };
  sourceRefs: ClinicalRecommendationSourceRefs;
  recommendationSetId: null;
  offeredAt: string | Date;
  recommendationChannel: "clinical_recommendation";
  supportsPreview: boolean;
  supportsRecommendation: boolean;
  supportsDiagnosis: false;
  supportsAuthorization: false;
  supportsDisposition: false;
  immutable: true;
  inClinicalRecommendationScope: boolean;
};

export type ClinicalRecommendationViewProjectionResult =
  | { ok: true; view: ClinicalRecommendationHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalRecommendationHttpCapability = {
  recommendationType: string;
  title: string;
  supportsPreview: boolean;
  supportsRecommendation: boolean;
  supportsDiagnosis: false;
  supportsAuthorization: false;
  supportsDisposition: false;
  immutable: true;
  inClinicalRecommendationScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalRecommendationPreviewResponse = {
  data: {
    recommendationType: ClinicalRecommendationType | string;
    consultationId: string;
    view: ClinicalRecommendationViewProjectionResult;
    gate: ClinicalRecommendationGateResult;
    capability: ClinicalRecommendationHttpCapability;
  };
};
