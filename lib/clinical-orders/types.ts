/**
 * Contrato HTTP del Clinical Orders Engine (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_ORDER_ENGINE_TYPES = [
  "prescription",
  "laboratory",
  "imaging",
  "procedure",
  "referral",
] as const;

export type ClinicalOrderEngineType =
  (typeof CLINICAL_ORDER_ENGINE_TYPES)[number];

export type ClinicalOrderGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalOrderGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalOrderGateIssue[] };

export type ClinicalOrderHttpView = {
  id: string;
  type: string;
  title: string;
  status: string;
  priority: string;
  countryCode: string;
  locale: string;
  consultationId: string | null;
  issuedAt: string | Date | null;
  validity: {
    validFrom: string | Date;
    validUntil: string | Date;
  } | null;
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
  payload: { kind: string } & Record<string, unknown>;
  origin: string;
  hitlRequired: true;
  orderedBy: { id: string; displayName: string; role: string } | null;
  approvedBy: { id: string; displayName: string; role: string } | null;
  sourceRef: { domain: string; id: string } | null;
  orderSetId: null;
  supportsPreview: boolean;
  supportsIssue: boolean;
  supportsDispatch: false;
  supportsDocument: boolean;
  requiresPersistedSource: boolean;
  rxForbiddenInE08: boolean;
};

export type ClinicalOrderViewProjectionResult =
  | { ok: true; view: ClinicalOrderHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalOrderHttpCapability = {
  type: string;
  title: string;
  supportsPreview: boolean;
  supportsIssue: boolean;
  supportsDispatch: false;
  supportsDocument: boolean;
  canBelongToOrderSet: boolean;
  requiresHitl: true;
  requiresPersistedSource: boolean;
  inClinicalEngineScope: boolean;
  enabledCountries: "*" | readonly string[];
  rxForbiddenInE08: boolean;
};

export type ClinicalOrderPreviewResponse = {
  data: {
    type: ClinicalOrderEngineType | string;
    consultationId: string;
    view: ClinicalOrderViewProjectionResult;
    gate: ClinicalOrderGateResult;
    capability: ClinicalOrderHttpCapability;
  };
};
