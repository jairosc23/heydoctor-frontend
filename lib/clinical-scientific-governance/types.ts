/**
 * Contrato HTTP del Clinical Scientific Governance (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_SCIENTIFIC_GOVERNANCE_TYPES = [
  "provenance_standing",
  "conflict_standing",
  "retraction_standing",
] as const;

export type ClinicalScientificGovernanceType =
  (typeof CLINICAL_SCIENTIFIC_GOVERNANCE_TYPES)[number];

export type ClinicalScientificGovernanceGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalScientificGovernanceGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalScientificGovernanceGateIssue[] };

export type ClinicalScientificGovernanceCitation = {
  knowledgeId?: string;
  evidenceId?: string;
  knowledgeClass?: string | null;
  evidenceClass?: string | null;
  version?: string | null;
};

export type ClinicalScientificGovernanceSourceRefs = {
  citations: ClinicalScientificGovernanceCitation[];
};

export type ClinicalScientificGovernanceHttpView = {
  id: string;
  scientificType: string;
  title: string;
  description: string;
  status: string;
  scientificStance: string;
  countryCode: string;
  locale: string;
  clinic: { id?: string; name: string; countryCode: string };
  payload: {
    kind: string;
    citations?: ClinicalScientificGovernanceCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; phiFree: true };
  parties: {
    clinic: { id?: string; name: string; countryCode: string };
  };
  sourceRefs: ClinicalScientificGovernanceSourceRefs;
  scientificSetId: null;
  constitutedAt: string | Date;
  scientificChannel: "clinical_scientific_governance";
  supportsPreview: boolean;
  supportsScientificGovernance: boolean;
  supportsEvidence: false;
  supportsKnowledge: false;
  supportsLearning: false;
  supportsReentry: false;
  supportsDiagnosis: false;
  supportsDecision: false;
  supportsGovernance: false;
  supportsAuthorization: false;
  supportsExecution: false;
  supportsEmission: false;
  immutable: true;
  inClinicalScientificGovernanceScope: boolean;
};

export type ClinicalScientificGovernanceViewProjectionResult =
  | { ok: true; view: ClinicalScientificGovernanceHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalScientificGovernanceHttpCapability = {
  scientificType: string;
  title: string;
  supportsPreview: boolean;
  supportsScientificGovernance: boolean;
  supportsEvidence: false;
  supportsKnowledge: false;
  supportsLearning: false;
  supportsReentry: false;
  supportsDiagnosis: false;
  supportsDecision: false;
  supportsGovernance: false;
  supportsAuthorization: false;
  supportsExecution: false;
  supportsEmission: false;
  immutable: true;
  inClinicalScientificGovernanceScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalScientificGovernancePreviewResponse = {
  data: {
    scientificType: ClinicalScientificGovernanceType | string;
    consultationId: string;
    view: ClinicalScientificGovernanceViewProjectionResult;
    gate: ClinicalScientificGovernanceGateResult;
    capability: ClinicalScientificGovernanceHttpCapability;
  };
};
