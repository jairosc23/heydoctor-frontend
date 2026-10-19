/**
 * Contrato HTTP del Clinical Evidence (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_EVIDENCE_TYPES = [
  "supporting_evidence",
  "contradicting_evidence",
  "limiting_evidence",
] as const;

export type ClinicalEvidenceType = (typeof CLINICAL_EVIDENCE_TYPES)[number];

export type ClinicalEvidenceGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalEvidenceGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalEvidenceGateIssue[] };

export type ClinicalEvidenceCitation = {
  knowledgeId: string;
  knowledgeClass?: string | null;
  version?: string | null;
};

export type ClinicalEvidenceSourceRefs = {
  citations: ClinicalEvidenceCitation[];
};

export type ClinicalEvidenceHttpView = {
  id: string;
  evidenceType: string;
  title: string;
  description: string;
  status: string;
  evidenceStance: string;
  countryCode: string;
  locale: string;
  clinic: { id?: string; name: string; countryCode: string };
  payload: {
    kind: string;
    citations?: ClinicalEvidenceCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; phiFree: true };
  parties: {
    clinic: { id?: string; name: string; countryCode: string };
  };
  sourceRefs: ClinicalEvidenceSourceRefs;
  evidenceSetId: null;
  constitutedAt: string | Date;
  evidenceChannel: "clinical_evidence";
  supportsPreview: boolean;
  supportsEvidence: boolean;
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
  inClinicalEvidenceScope: boolean;
};

export type ClinicalEvidenceViewProjectionResult =
  | { ok: true; view: ClinicalEvidenceHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalEvidenceHttpCapability = {
  evidenceType: string;
  title: string;
  supportsPreview: boolean;
  supportsEvidence: boolean;
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
  inClinicalEvidenceScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalEvidencePreviewResponse = {
  data: {
    evidenceType: ClinicalEvidenceType | string;
    consultationId: string;
    view: ClinicalEvidenceViewProjectionResult;
    gate: ClinicalEvidenceGateResult;
    capability: ClinicalEvidenceHttpCapability;
  };
};
