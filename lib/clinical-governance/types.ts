/**
 * Contrato HTTP del Clinical Governance (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_GOVERNANCE_TYPES = [
  "therapeutic_governance",
  "investigation_governance",
  "precaution_governance",
] as const;

export type ClinicalGovernanceType = (typeof CLINICAL_GOVERNANCE_TYPES)[number];

export type ClinicalGovernanceGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalGovernanceGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalGovernanceGateIssue[] };

export type ClinicalGovernanceRecommendationCitation = {
  recommendationId: string;
  recommendationType?: string | null;
};

export type ClinicalGovernanceSourceRefs = {
  recommendations: ClinicalGovernanceRecommendationCitation[];
};

export type ClinicalGovernanceHttpView = {
  id: string;
  governanceType: string;
  title: string;
  description: string;
  status: string;
  posture: string;
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
    recommendations?: ClinicalGovernanceRecommendationCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; recommendationOffered: true };
  sourceRefs: ClinicalGovernanceSourceRefs;
  governanceSetId: null;
  governedAt: string | Date;
  governanceChannel: "clinical_governance";
  supportsPreview: boolean;
  supportsGovernance: boolean;
  supportsDiagnosis: false;
  supportsAuthorization: false;
  supportsDisposition: false;
  supportsExecution: false;
  immutable: true;
  inClinicalGovernanceScope: boolean;
};

export type ClinicalGovernanceViewProjectionResult =
  | { ok: true; view: ClinicalGovernanceHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalGovernanceHttpCapability = {
  governanceType: string;
  title: string;
  supportsPreview: boolean;
  supportsGovernance: boolean;
  supportsDiagnosis: false;
  supportsAuthorization: false;
  supportsDisposition: false;
  supportsExecution: false;
  immutable: true;
  inClinicalGovernanceScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalGovernancePreviewResponse = {
  data: {
    governanceType: ClinicalGovernanceType | string;
    consultationId: string;
    view: ClinicalGovernanceViewProjectionResult;
    gate: ClinicalGovernanceGateResult;
    capability: ClinicalGovernanceHttpCapability;
  };
};
