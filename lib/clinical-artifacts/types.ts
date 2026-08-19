/**
 * Contrato HTTP del Clinical Artifact Registry (D5 preview / D6 Encounter).
 * El frontend no reconstruye el agregado: solo consume el JSON oficial.
 */

export const CLINICAL_ARTIFACT_TYPES = [
  "clinical_document",
  "clinical_order",
  "clinical_decision",
  "encounter_close",
  "authority_event",
] as const;

export type ClinicalArtifactType = (typeof CLINICAL_ARTIFACT_TYPES)[number];

export type ClinicalArtifactGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalArtifactGateResult =
  | { ok: true; issues: [] }
  | { ok: false; issues: ClinicalArtifactGateIssue[] };

export type ClinicalArtifactHttpView = {
  id: string;
  artifactType: string;
  title: string;
  description: string;
  status: string;
  countryCode: string;
  locale: string;
  consultationId: string;
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
  provenance: { origin: string; hitlSatisfied: true };
  sourceRefs: { actId: string; actClass: string }[];
  relatedArtifactId: string | null;
  artifactBundleId: null;
  recordedAt: string | Date;
  registryChannel: "clinical_artifact_registry";
  supportsPreview: boolean;
  supportsHistory: boolean;
  supportsTraceability: boolean;
  supportsRelationship: boolean;
  immutable: true;
  inRegistryScope: boolean;
};

export type ClinicalArtifactViewProjectionResult =
  | { ok: true; view: ClinicalArtifactHttpView }
  | { ok: false; reason: "type_mismatch" | "preview_not_supported" };

export type ClinicalArtifactHttpCapability = {
  artifactType: string;
  title: string;
  supportsPreview: boolean;
  supportsHistory: boolean;
  supportsTraceability: boolean;
  supportsRelationship: boolean;
  immutable: true;
  inRegistryScope: boolean;
  enabledCountries: "*" | readonly string[];
};

export type ClinicalArtifactPreviewResponse = {
  data: {
    artifactType: ClinicalArtifactType | string;
    consultationId: string;
    view: ClinicalArtifactViewProjectionResult;
    gate: ClinicalArtifactGateResult;
    capability: ClinicalArtifactHttpCapability;
  };
};
