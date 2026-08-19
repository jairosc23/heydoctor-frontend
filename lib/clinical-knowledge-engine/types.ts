/**
 * Contrato HTTP del Clinical Knowledge Engine (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_KNOWLEDGE_ENGINE_TYPES = [
  "eligible_advice",
  "withheld_advice",
  "conditional_advice",
] as const;

export type ClinicalKnowledgeEngineType =
  (typeof CLINICAL_KNOWLEDGE_ENGINE_TYPES)[number];

export type ClinicalKnowledgeEngineGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalKnowledgeEngineGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalKnowledgeEngineGateIssue[] };

export type ClinicalKnowledgeEngineCitation = {
  jurisdictionId: string;
  jurisdictionClass?: string | null;
  version?: string | null;
};

export type ClinicalKnowledgeEngineSourceRefs = {
  citations: ClinicalKnowledgeEngineCitation[];
};

export type ClinicalKnowledgeEngineHttpView = {
  id: string;
  adviseType: string;
  title: string;
  description: string;
  status: string;
  adviseStance: string;
  countryCode: string;
  locale: string;
  clinic: { id?: string; name: string; countryCode: string };
  payload: {
    kind: string;
    citations?: ClinicalKnowledgeEngineCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; phiFree: true };
  parties: {
    clinic: { id?: string; name: string; countryCode: string };
  };
  sourceRefs: ClinicalKnowledgeEngineSourceRefs;
  engineSetId: null;
  constitutedAt: string | Date;
  engineChannel: "clinical_knowledge_engine";
  supportsPreview: boolean;
  supportsAdvise: boolean;
  supportsJurisdiction: false;
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
  inClinicalKnowledgeEngineScope: boolean;
};

export type ClinicalKnowledgeEngineViewProjectionResult =
  | { ok: true; view: ClinicalKnowledgeEngineHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalKnowledgeEngineHttpCapability = {
  adviseType: string;
  title: string;
  supportsPreview: boolean;
  supportsAdvise: boolean;
  supportsJurisdiction: false;
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
  inClinicalKnowledgeEngineScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalKnowledgeEnginePreviewResponse = {
  data: {
    adviseType: ClinicalKnowledgeEngineType | string;
    consultationId: string;
    view: ClinicalKnowledgeEngineViewProjectionResult;
    gate: ClinicalKnowledgeEngineGateResult;
    capability: ClinicalKnowledgeEngineHttpCapability;
  };
};
