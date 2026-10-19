/**
 * Contrato HTTP del Clinical Knowledge Grounding (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_KNOWLEDGE_GROUNDING_TYPES = [
  "grounded_attribution",
  "withheld_attribution",
  "conditional_attribution",
] as const;

export type ClinicalKnowledgeGroundingType =
  (typeof CLINICAL_KNOWLEDGE_GROUNDING_TYPES)[number];

export type ClinicalKnowledgeGroundingGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalKnowledgeGroundingGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalKnowledgeGroundingGateIssue[] };

export type ClinicalKnowledgeGroundingCitation = {
  engineId: string;
  engineClass?: string | null;
  version?: string | null;
};

export type ClinicalKnowledgeGroundingSourceRefs = {
  citations: ClinicalKnowledgeGroundingCitation[];
};

export type ClinicalKnowledgeGroundingHttpView = {
  id: string;
  groundingType: string;
  title: string;
  description: string;
  status: string;
  groundingStance: string;
  countryCode: string;
  locale: string;
  clinic: { id?: string; name: string; countryCode: string };
  payload: {
    kind: string;
    citations?: ClinicalKnowledgeGroundingCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; phiFree: true };
  parties: {
    clinic: { id?: string; name: string; countryCode: string };
  };
  sourceRefs: ClinicalKnowledgeGroundingSourceRefs;
  groundingSetId: null;
  constitutedAt: string | Date;
  groundingChannel: "clinical_knowledge_grounding";
  supportsPreview: boolean;
  supportsGrounding: boolean;
  supportsAdvise: false;
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
  inClinicalKnowledgeGroundingScope: boolean;
};

export type ClinicalKnowledgeGroundingViewProjectionResult =
  | { ok: true; view: ClinicalKnowledgeGroundingHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalKnowledgeGroundingHttpCapability = {
  groundingType: string;
  title: string;
  supportsPreview: boolean;
  supportsGrounding: boolean;
  supportsAdvise: false;
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
  inClinicalKnowledgeGroundingScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalKnowledgeGroundingPreviewResponse = {
  data: {
    groundingType: ClinicalKnowledgeGroundingType | string;
    consultationId: string;
    view: ClinicalKnowledgeGroundingViewProjectionResult;
    gate: ClinicalKnowledgeGroundingGateResult;
    capability: ClinicalKnowledgeGroundingHttpCapability;
  };
};
