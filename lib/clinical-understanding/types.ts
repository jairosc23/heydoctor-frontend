/**
 * Contrato HTTP del Clinical Understanding (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_UNDERSTANDING_TYPES = [
  "situation_understanding",
  "problem_understanding",
  "therapy_understanding",
  "risk_understanding",
  "epistemic_understanding",
] as const;

export type ClinicalUnderstandingType =
  (typeof CLINICAL_UNDERSTANDING_TYPES)[number];

export type ClinicalUnderstandingGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalUnderstandingGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalUnderstandingGateIssue[] };

export type ClinicalUnderstandingFactCitation = {
  artifactId: string;
  artifactType?: string | null;
};

export type ClinicalUnderstandingRecordCitation = {
  recordId: string;
  recordType?: string | null;
};

export type ClinicalUnderstandingSourceRefs = {
  facts: ClinicalUnderstandingFactCitation[];
  recordRefs: ClinicalUnderstandingRecordCitation[];
};

export type ClinicalUnderstandingHttpView = {
  id: string;
  understandingType: string;
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
    facts?: ClinicalUnderstandingFactCitation[] | null;
    recordRefs?: ClinicalUnderstandingRecordCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; factsRegistered: true };
  sourceRefs: ClinicalUnderstandingSourceRefs;
  understandingSetId: null;
  assembledAt: string | Date;
  understandingChannel: "clinical_understanding";
  supportsPreview: boolean;
  supportsAssembly: boolean;
  supportsDiagnosis: false;
  supportsReasoning: false;
  immutable: true;
  inClinicalUnderstandingScope: boolean;
};

export type ClinicalUnderstandingViewProjectionResult =
  | { ok: true; view: ClinicalUnderstandingHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalUnderstandingHttpCapability = {
  understandingType: string;
  title: string;
  supportsPreview: boolean;
  supportsAssembly: boolean;
  supportsDiagnosis: false;
  supportsReasoning: false;
  immutable: true;
  inClinicalUnderstandingScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalUnderstandingPreviewResponse = {
  data: {
    understandingType: ClinicalUnderstandingType | string;
    consultationId: string;
    view: ClinicalUnderstandingViewProjectionResult;
    gate: ClinicalUnderstandingGateResult;
    capability: ClinicalUnderstandingHttpCapability;
  };
};
