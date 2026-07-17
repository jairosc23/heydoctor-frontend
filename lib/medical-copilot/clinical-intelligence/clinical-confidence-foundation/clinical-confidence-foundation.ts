/**
 * AI-23 — ClinicalConfidenceFoundation contracts (frontend).
 */

export const CLINICAL_CONFIDENCE_FOUNDATION_VERSION = "1.0.0" as const;

export const CLINICAL_CONFIDENCE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type ClinicalConfidenceFoundationSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "confidence_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type ClinicalConfidenceFoundationMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  differentialId: string;
  evidenceMappingId: string;
  evidenceCoverage: string;
  completeness: string;
  missingInformation: string;
  structuralConfidence: string;
  generatedAt: string;
  builderVersion: typeof CLINICAL_CONFIDENCE_FOUNDATION_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type ClinicalConfidenceFoundation = {
  confidenceId: string;
  providerId: AiLayerProviderId;
  confidenceSlots: ClinicalConfidenceFoundationSlot[];
  governance: typeof CLINICAL_CONFIDENCE_GOVERNANCE;
  metadata: ClinicalConfidenceFoundationMetadata;
};

export type ClinicalConfidenceFoundationBuilderResult = {
  source: "clinical_confidence_foundation";
  builderVersion: typeof CLINICAL_CONFIDENCE_FOUNDATION_VERSION;
  confidence: ClinicalConfidenceFoundation;
  governance: typeof CLINICAL_CONFIDENCE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
