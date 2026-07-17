/**
 * AI-22 — EvidenceMappingFoundation contracts (frontend).
 */

export const EVIDENCE_MAPPING_FOUNDATION_VERSION = "1.0.0" as const;

export const EVIDENCE_MAPPING_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type EvidenceMappingFoundationSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "evidence_mapping_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type EvidenceMappingFoundationMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  differentialId: string;
  findingRefId: string;
  insightRefId: string;
  generatedAt: string;
  builderVersion: typeof EVIDENCE_MAPPING_FOUNDATION_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type EvidenceMappingFoundation = {
  evidenceMappingId: string;
  providerId: AiLayerProviderId;
  mappingSlots: EvidenceMappingFoundationSlot[];
  governance: typeof EVIDENCE_MAPPING_GOVERNANCE;
  metadata: EvidenceMappingFoundationMetadata;
};

export type EvidenceMappingFoundationBuilderResult = {
  source: "evidence_mapping_foundation";
  builderVersion: typeof EVIDENCE_MAPPING_FOUNDATION_VERSION;
  evidenceMapping: EvidenceMappingFoundation;
  governance: typeof EVIDENCE_MAPPING_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
