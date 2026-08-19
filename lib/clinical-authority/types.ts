/**
 * Contrato HTTP del Clinical Authority Spine (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_AUTHORITY_ACT_CLASSES = [
  "medication",
  "order",
  "clinical_document",
  "encounter_close",
] as const;

export type ClinicalAuthorityActClass =
  (typeof CLINICAL_AUTHORITY_ACT_CLASSES)[number];

export type ClinicalAuthorityGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalAuthorityGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalAuthorityGateIssue[] };

export type ClinicalAuthorityHttpView = {
  id: string;
  actClass: string;
  title: string;
  description: string;
  status: string;
  countryCode: string;
  locale: string;
  consultationId: string | null;
  validity: null;
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
  provenance: { origin: string; hitlRequired: true };
  sourceRefs: { engine: string; previewType: string; consultationId: string }[];
  confirmedBy: { id: string; displayName: string; role: string } | null;
  decisionReason: string | null;
  habDecisionId: string | null;
  emissionId: string | null;
  emittedAt: null;
  authorityChannel: "clinical_authority_spine";
  supportsPreview: boolean;
  supportsConfirm: boolean;
  supportsAuthorize: boolean;
  supportsEmission: false;
  requiresHitl: true;
  requiresPhysician: true;
  inAuthoritySpineScope: boolean;
};

export type ClinicalAuthorityViewProjectionResult =
  | { ok: true; view: ClinicalAuthorityHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalAuthorityHttpCapability = {
  actClass: string;
  title: string;
  supportsPreview: boolean;
  supportsConfirm: boolean;
  supportsAuthorize: boolean;
  supportsEmission: false;
  requiresHitl: true;
  requiresPhysician: true;
  inAuthoritySpineScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalAuthorityPreviewResponse = {
  data: {
    actClass: ClinicalAuthorityActClass | string;
    consultationId: string;
    view: ClinicalAuthorityViewProjectionResult;
    gate: ClinicalAuthorityGateResult;
    capability: ClinicalAuthorityHttpCapability;
  };
};
