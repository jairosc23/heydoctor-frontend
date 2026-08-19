/**
 * Contrato HTTP del Clinical Knowledge Jurisdiction (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_KNOWLEDGE_JURISDICTION_TYPES = [
  "in_force_standing",
  "withheld_standing",
  "conditional_standing",
] as const;

export type ClinicalKnowledgeJurisdictionType =
  (typeof CLINICAL_KNOWLEDGE_JURISDICTION_TYPES)[number];

export type ClinicalKnowledgeJurisdictionGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalKnowledgeJurisdictionGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalKnowledgeJurisdictionGateIssue[] };

export type ClinicalKnowledgeJurisdictionCitation = {
  federationId: string;
  federationClass?: string | null;
  version?: string | null;
};

export type ClinicalKnowledgeJurisdictionSourceRefs = {
  citations: ClinicalKnowledgeJurisdictionCitation[];
};

export type ClinicalKnowledgeJurisdictionHttpView = {
  id: string;
  jurisdictionType: string;
  title: string;
  description: string;
  status: string;
  jurisdictionStance: string;
  countryCode: string;
  locale: string;
  clinic: { id?: string; name: string; countryCode: string };
  payload: {
    kind: string;
    citations?: ClinicalKnowledgeJurisdictionCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; phiFree: true };
  parties: {
    clinic: { id?: string; name: string; countryCode: string };
  };
  sourceRefs: ClinicalKnowledgeJurisdictionSourceRefs;
  jurisdictionSetId: null;
  constitutedAt: string | Date;
  jurisdictionChannel: "clinical_knowledge_jurisdiction";
  supportsPreview: boolean;
  supportsJurisdiction: boolean;
  supportsFederation: false;
  supportsScientificGovernance: false;
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
  inClinicalKnowledgeJurisdictionScope: boolean;
};

export type ClinicalKnowledgeJurisdictionViewProjectionResult =
  | { ok: true; view: ClinicalKnowledgeJurisdictionHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalKnowledgeJurisdictionHttpCapability = {
  jurisdictionType: string;
  title: string;
  supportsPreview: boolean;
  supportsJurisdiction: boolean;
  supportsFederation: false;
  supportsScientificGovernance: false;
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
  inClinicalKnowledgeJurisdictionScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalKnowledgeJurisdictionPreviewResponse = {
  data: {
    jurisdictionType: ClinicalKnowledgeJurisdictionType | string;
    consultationId: string;
    view: ClinicalKnowledgeJurisdictionViewProjectionResult;
    gate: ClinicalKnowledgeJurisdictionGateResult;
    capability: ClinicalKnowledgeJurisdictionHttpCapability;
  };
};
