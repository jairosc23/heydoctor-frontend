/**
 * Contrato HTTP del Longitudinal Clinical Record (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const LONGITUDINAL_RECORD_TYPES = [
  "encounters",
  "documents",
  "orders",
  "clinical_decisions",
  "authority_events",
  "artifacts",
] as const;

export type LongitudinalRecordType = (typeof LONGITUDINAL_RECORD_TYPES)[number];

export type LongitudinalRecordGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type LongitudinalRecordGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: LongitudinalRecordGateIssue[] };

export type LongitudinalFactCitation = {
  artifactId: string;
  artifactType?: string | null;
};

export type LongitudinalClinicalRecordHttpView = {
  id: string;
  recordType: string;
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
  payload: { kind: string; facts?: LongitudinalFactCitation[] | null } & Record<
    string,
    unknown
  >;
  provenance: { origin: string; factsRegistered: true };
  sourceRefs: LongitudinalFactCitation[];
  timelineGroupId: null;
  composedAt: string | Date;
  recordChannel: "longitudinal_clinical_record";
  supportsPreview: boolean;
  supportsLongitudinalView: boolean;
  supportsHistoryNavigation: boolean;
  supportsTimeline: false;
  immutable: true;
  inLongitudinalScope: boolean;
};

export type LongitudinalClinicalRecordViewProjectionResult =
  | { ok: true; view: LongitudinalClinicalRecordHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type LongitudinalHttpCapability = {
  recordType: string;
  title: string;
  supportsPreview: boolean;
  supportsLongitudinalView: boolean;
  supportsHistoryNavigation: boolean;
  supportsTimeline: false;
  immutable: true;
  inLongitudinalScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type LongitudinalClinicalRecordPreviewResponse = {
  data: {
    recordType: LongitudinalRecordType | string;
    consultationId: string;
    view: LongitudinalClinicalRecordViewProjectionResult;
    gate: LongitudinalRecordGateResult;
    capability: LongitudinalHttpCapability;
  };
};
