/**
 * Contrato HTTP del Clinical Reentry (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_REENTRY_TYPES = [
  "therapeutic_reentry",
  "investigation_reentry",
  "precaution_reentry",
] as const;

export type ClinicalReentryType = (typeof CLINICAL_REENTRY_TYPES)[number];

export type ClinicalReentryGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalReentryGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalReentryGateIssue[] };

export type ClinicalReentryLearningCitation = {
  learningId: string;
  learningType?: string | null;
  learningReturn?: string | null;
};

export type ClinicalReentrySourceRefs = {
  learnings: ClinicalReentryLearningCitation[];
};

export type ClinicalReentryHttpView = {
  id: string;
  reentryType: string;
  title: string;
  description: string;
  status: string;
  reentryAdmission: string;
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
    learnings?: ClinicalReentryLearningCitation[] | null;
  } & Record<string, unknown>;
  provenance: { origin: string; learningConstituted: true };
  sourceRefs: ClinicalReentrySourceRefs;
  reentrySetId: null;
  reenteredAt: string | Date;
  reentryChannel: "clinical_reentry";
  supportsPreview: boolean;
  supportsReentry: boolean;
  supportsLearning: false;
  supportsDiagnosis: false;
  supportsDecision: false;
  supportsGovernance: false;
  supportsAuthorization: false;
  supportsExecution: false;
  supportsEmission: false;
  immutable: true;
  inClinicalReentryScope: boolean;
};

export type ClinicalReentryViewProjectionResult =
  | { ok: true; view: ClinicalReentryHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalReentryHttpCapability = {
  reentryType: string;
  title: string;
  supportsPreview: boolean;
  supportsReentry: boolean;
  supportsLearning: false;
  supportsDiagnosis: false;
  supportsDecision: false;
  supportsGovernance: false;
  supportsAuthorization: false;
  supportsExecution: false;
  supportsEmission: false;
  immutable: true;
  inClinicalReentryScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalReentryPreviewResponse = {
  data: {
    reentryType: ClinicalReentryType | string;
    consultationId: string;
    view: ClinicalReentryViewProjectionResult;
    gate: ClinicalReentryGateResult;
    capability: ClinicalReentryHttpCapability;
  };
};
