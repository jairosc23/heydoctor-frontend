import type {
  ClinicalDocumentEngineType,
  ClinicalDocumentGateResult,
  ClinicalDocumentPreviewResponse,
} from "./types";
import { CLINICAL_DOCUMENT_TYPE_LABELS } from "./types";

/**
 * DocumentCapability derivada exclusivamente del preview oficial (ADR-022).
 * No duplica allowlists de país ni reglas de Gate: lee `gate` + `provenance`.
 */
export type PreviewDocumentCapability = {
  type: ClinicalDocumentEngineType | string;
  title: string;
  supportsPreview: true;
  supportsPdf: boolean;
  requiresHitl: boolean;
  enabledForCountry: boolean;
  countryCode: string;
};

export function isCountryCapabilityBlocked(
  gate: ClinicalDocumentGateResult,
): boolean {
  return gate.issues.some((issue) =>
    issue.code.includes("country_not_enabled"),
  );
}

export function documentCapabilityFromPreview(
  preview: ClinicalDocumentPreviewResponse,
): PreviewDocumentCapability {
  const { type, model, gate } = preview.data;
  const enabledForCountry = !isCountryCapabilityBlocked(gate);
  const title =
    CLINICAL_DOCUMENT_TYPE_LABELS[
      type as keyof typeof CLINICAL_DOCUMENT_TYPE_LABELS
    ] ?? String(type).replace(/_/g, " ");

  return {
    type,
    title,
    supportsPreview: true,
    supportsPdf: gate.ok && enabledForCountry,
    requiresHitl: model.provenance.hitlRequired !== false,
    enabledForCountry,
    countryCode: model.countryCode,
  };
}
