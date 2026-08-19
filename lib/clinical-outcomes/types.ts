/**
 * Contrato HTTP del Clinical Outcomes (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_OUTCOME_TYPES = [
  "therapeutic_outcome",
  "investigation_outcome",
  "precaution_outcome",
] as const;

export type ClinicalOutcomeType = (typeof CLINICAL_OUTCOME_TYPES)[number];

export type ClinicalOutcomeGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalOutcomeGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalOutcomeGateIssue[] };

export type ClinicalOutcomeRecordCitation = {
  recordId: string;
  recordType?: string | null;
};

export type ClinicalOutcomeSourceRefs = {
  records: ClinicalOutcomeRecordCitation[];
};

export type ClinicalOutcomeHttpView = {
  id: string;
  outcomeType: string;
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
    records?: ClinicalOutcomeRecordCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; recordComposed: true };
  sourceRefs: ClinicalOutcomeSourceRefs;
  outcomeSetId: null;
  observedAt: string | Date;
  outcomeChannel: "clinical_outcomes";
  supportsPreview: boolean;
  supportsOutcome: boolean;
  supportsDiagnosis: false;
  supportsAuthorization: false;
  supportsLearning: false;
  immutable: true;
  inClinicalOutcomesScope: boolean;
};

export type ClinicalOutcomeViewProjectionResult =
  | { ok: true; view: ClinicalOutcomeHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalOutcomeHttpCapability = {
  outcomeType: string;
  title: string;
  supportsPreview: boolean;
  supportsOutcome: boolean;
  supportsDiagnosis: false;
  supportsAuthorization: false;
  supportsLearning: false;
  immutable: true;
  inClinicalOutcomesScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalOutcomePreviewResponse = {
  data: {
    outcomeType: ClinicalOutcomeType | string;
    consultationId: string;
    view: ClinicalOutcomeViewProjectionResult;
    gate: ClinicalOutcomeGateResult;
    capability: ClinicalOutcomeHttpCapability;
  };
};
