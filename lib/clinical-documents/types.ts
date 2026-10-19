/**
 * Contrato HTTP del Clinical Documents Engine (D1 preview / D5 PDF).
 * El frontend no reconstruye el modelo: solo consume el JSON oficial.
 */

export const CLINICAL_DOCUMENT_ENGINE_TYPES = [
  "visit_summary",
  "clinical_history",
  "medical_leave",
] as const;

export type ClinicalDocumentEngineType =
  (typeof CLINICAL_DOCUMENT_ENGINE_TYPES)[number];

export type ClinicalDocumentPdfDisposition = "inline" | "attachment";

export type ClinicalDocumentGateIssue = {
  code: string;
  field: string;
  message: string;
};

export type ClinicalDocumentGateResult =
  { ok: true; issues: [] } | { ok: false; issues: ClinicalDocumentGateIssue[] };

export type ClinicalDocumentPreviewModel = {
  type: string;
  countryCode: string;
  locale?: string;
  issuedAt?: string | Date;
  consultationId?: string | null;
  clinic: { name: string; countryCode: string };
  doctor: { name: string };
  patient: { name: string };
  payload: { kind: string } & Record<string, unknown>;
  provenance: {
    hitlRequired: boolean;
    generatedByAi: boolean;
    sources: string[];
  };
};

export type ClinicalDocumentPreviewResponse = {
  data: {
    type: ClinicalDocumentEngineType | string;
    consultationId: string;
    model: ClinicalDocumentPreviewModel;
    gate: ClinicalDocumentGateResult;
  };
};

export const CLINICAL_DOCUMENT_TYPE_LABELS: Record<
  ClinicalDocumentEngineType,
  string
> = {
  visit_summary: "Resumen de consulta",
  clinical_history: "Historia clínica",
  medical_leave: "Licencia médica",
};
