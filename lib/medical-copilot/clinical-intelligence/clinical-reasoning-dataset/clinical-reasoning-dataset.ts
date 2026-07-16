/**
 * AI-51 — ClinicalReasoningDataset contracts (frontend).
 */

export const CLINICAL_REASONING_DATASET_VERSION = "1.0.0" as const;

export const CLINICAL_REASONING_DATASET_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type ClinicalReasoningDatasetSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "reasoning_dataset_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type ClinicalReasoningDatasetMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  clinicalReasoningPackageId: string;
  generatedAt: string;
  builderVersion: typeof CLINICAL_REASONING_DATASET_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type ClinicalReasoningDataset = {
  clinicalReasoningDatasetId: string;
  providerId: AiLayerProviderId;
  datasetSlots: ClinicalReasoningDatasetSlot[];
  governance: typeof CLINICAL_REASONING_DATASET_GOVERNANCE;
  metadata: ClinicalReasoningDatasetMetadata;
};

export type ClinicalReasoningDatasetBuilderResult = {
  source: "clinical_reasoning_dataset";
  builderVersion: typeof CLINICAL_REASONING_DATASET_VERSION;
  clinicalReasoningDataset: ClinicalReasoningDataset;
  governance: typeof CLINICAL_REASONING_DATASET_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
