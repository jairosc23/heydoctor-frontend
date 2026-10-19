/**
 * Contrato HTTP del Clinical Decision Support Engine (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_DECISION_ENGINE_TYPES = [
  "allergy_conflict",
  "drug_interaction",
  "duplicate_therapy",
  "contraindication",
  "guideline_reminder",
] as const;

export type ClinicalDecisionEngineType =
  (typeof CLINICAL_DECISION_ENGINE_TYPES)[number];

export type ClinicalDecisionGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalDecisionGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalDecisionGateIssue[] };

export type ClinicalDecisionHttpView = {
  id: string;
  type: string;
  title: string;
  status: string;
  severity: string;
  countryCode: string;
  locale: string;
  consultationId: string | null;
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
  provenance: { origin: string; hitlRequired: true };
  reviewedBy: { id: string; displayName: string; role: string } | null;
  overrideReason: string | null;
  sourceRefs: { domain: string; id: string }[];
  relatedOrderId: string | null;
  relatedDocumentId: string | null;
  decisionSetId: null;
  supportsPreview: boolean;
  supportsAcknowledge: boolean;
  supportsOverride: boolean;
  evaluatesRules: false;
  aiForbidden: true;
  requiresHitl: true;
  requiresSourceRef: boolean;
  canBelongToDecisionSet: boolean;
};

export type ClinicalDecisionViewProjectionResult =
  | { ok: true; view: ClinicalDecisionHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalDecisionHttpCapability = {
  type: string;
  title: string;
  supportsPreview: boolean;
  supportsAcknowledge: boolean;
  supportsOverride: boolean;
  evaluatesRules: false;
  aiForbidden: true;
  requiresHitl: true;
  requiresSourceRef: boolean;
  canBelongToDecisionSet: boolean;
  inClinicalEngineScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalDecisionPreviewResponse = {
  data: {
    type: ClinicalDecisionEngineType | string;
    consultationId: string;
    view: ClinicalDecisionViewProjectionResult;
    gate: ClinicalDecisionGateResult;
    capability: ClinicalDecisionHttpCapability;
  };
};
