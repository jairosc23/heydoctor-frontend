/**
 * AI-21 — ClinicalDifferentialFoundation contracts (frontend).
 */

export const CLINICAL_DIFFERENTIAL_FOUNDATION_VERSION = "1.0.0" as const;

export const DIFFERENTIAL_FOUNDATION_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type ClinicalDifferentialFoundationSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "differential_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type ClinicalDifferentialFoundationMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  contextId: string;
  clinicalPlanId: string;
  responseId: string;
  generatedAt: string;
  builderVersion: typeof CLINICAL_DIFFERENTIAL_FOUNDATION_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type ClinicalDifferentialFoundation = {
  differentialId: string;
  providerId: AiLayerProviderId;
  differentialSlots: ClinicalDifferentialFoundationSlot[];
  governance: typeof DIFFERENTIAL_FOUNDATION_GOVERNANCE;
  metadata: ClinicalDifferentialFoundationMetadata;
};

export type ClinicalDifferentialFoundationBuilderResult = {
  source: "clinical_differential_foundation";
  builderVersion: typeof CLINICAL_DIFFERENTIAL_FOUNDATION_VERSION;
  differential: ClinicalDifferentialFoundation;
  governance: typeof DIFFERENTIAL_FOUNDATION_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
