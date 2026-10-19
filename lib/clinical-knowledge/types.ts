/**
 * Contrato HTTP del Clinical Knowledge (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_KNOWLEDGE_TYPES = [
  "protocol_knowledge",
  "relational_knowledge",
  "constraint_knowledge",
] as const;

export type ClinicalKnowledgeType = (typeof CLINICAL_KNOWLEDGE_TYPES)[number];

export type ClinicalKnowledgeGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalKnowledgeGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalKnowledgeGateIssue[] };

export type ClinicalKnowledgeCitation = {
  knowledgeId: string;
  knowledgeClass?: string | null;
  version?: string | null;
};

export type ClinicalKnowledgeSourceRefs = {
  citations: ClinicalKnowledgeCitation[];
};

export type ClinicalKnowledgeHttpView = {
  id: string;
  knowledgeType: string;
  title: string;
  description: string;
  status: string;
  knowledgeStance: string;
  countryCode: string;
  locale: string;
  clinic: { id?: string; name: string; countryCode: string };
  payload: {
    kind: string;
    citations?: ClinicalKnowledgeCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; phiFree: true };
  parties: {
    clinic: { id?: string; name: string; countryCode: string };
  };
  sourceRefs: ClinicalKnowledgeSourceRefs;
  knowledgeSetId: null;
  constitutedAt: string | Date;
  knowledgeChannel: "clinical_knowledge";
  supportsPreview: boolean;
  supportsKnowledge: boolean;
  supportsLearning: false;
  supportsReentry: false;
  supportsDiagnosis: false;
  supportsDecision: false;
  supportsGovernance: false;
  supportsAuthorization: false;
  supportsExecution: false;
  supportsEmission: false;
  immutable: true;
  inClinicalKnowledgeScope: boolean;
};

export type ClinicalKnowledgeViewProjectionResult =
  | { ok: true; view: ClinicalKnowledgeHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalKnowledgeHttpCapability = {
  knowledgeType: string;
  title: string;
  supportsPreview: boolean;
  supportsKnowledge: boolean;
  supportsLearning: false;
  supportsReentry: false;
  supportsDiagnosis: false;
  supportsDecision: false;
  supportsGovernance: false;
  supportsAuthorization: false;
  supportsExecution: false;
  supportsEmission: false;
  immutable: true;
  inClinicalKnowledgeScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalKnowledgePreviewResponse = {
  data: {
    knowledgeType: ClinicalKnowledgeType | string;
    consultationId: string;
    view: ClinicalKnowledgeViewProjectionResult;
    gate: ClinicalKnowledgeGateResult;
    capability: ClinicalKnowledgeHttpCapability;
  };
};
