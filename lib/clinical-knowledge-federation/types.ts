/**
 * Contrato HTTP del Clinical Knowledge Federation (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_KNOWLEDGE_FEDERATION_TYPES = [
  "federable_standing",
  "retained_standing",
  "restricted_standing",
] as const;

export type ClinicalKnowledgeFederationType =
  (typeof CLINICAL_KNOWLEDGE_FEDERATION_TYPES)[number];

export type ClinicalKnowledgeFederationGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalKnowledgeFederationGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalKnowledgeFederationGateIssue[] };

export type ClinicalKnowledgeFederationCitation = {
  scientificId: string;
  scientificClass?: string | null;
  version?: string | null;
};

export type ClinicalKnowledgeFederationSourceRefs = {
  citations: ClinicalKnowledgeFederationCitation[];
};

export type ClinicalKnowledgeFederationHttpView = {
  id: string;
  federationType: string;
  title: string;
  description: string;
  status: string;
  federationStance: string;
  countryCode: string;
  locale: string;
  clinic: { id?: string; name: string; countryCode: string };
  payload: {
    kind: string;
    citations?: ClinicalKnowledgeFederationCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; phiFree: true };
  parties: {
    clinic: { id?: string; name: string; countryCode: string };
  };
  sourceRefs: ClinicalKnowledgeFederationSourceRefs;
  federationSetId: null;
  constitutedAt: string | Date;
  federationChannel: "clinical_knowledge_federation";
  supportsPreview: boolean;
  supportsFederation: boolean;
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
  inClinicalKnowledgeFederationScope: boolean;
};

export type ClinicalKnowledgeFederationViewProjectionResult =
  | { ok: true; view: ClinicalKnowledgeFederationHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalKnowledgeFederationHttpCapability = {
  federationType: string;
  title: string;
  supportsPreview: boolean;
  supportsFederation: boolean;
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
  inClinicalKnowledgeFederationScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalKnowledgeFederationPreviewResponse = {
  data: {
    federationType: ClinicalKnowledgeFederationType | string;
    consultationId: string;
    view: ClinicalKnowledgeFederationViewProjectionResult;
    gate: ClinicalKnowledgeFederationGateResult;
    capability: ClinicalKnowledgeFederationHttpCapability;
  };
};
