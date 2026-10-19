/**
 * AI-55 — GovernedClinicalReasoningDataset contracts (frontend).
 */

export const GOVERNED_CLINICAL_REASONING_DATASET_VERSION = "1.0.0" as const;

export const GOVERNED_CLINICAL_REASONING_DATASET_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedClinicalReasoningDatasetSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "governed_reasoning_dataset_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedClinicalReasoningDatasetMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  governedReasoningWorkspaceId: string;
  clinicalReasoningPackageId: string;
  reviewSessionId: string;
  assessmentPackageId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_CLINICAL_REASONING_DATASET_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedClinicalReasoningDataset = {
  governedClinicalReasoningDatasetId: string;
  providerId: AiLayerProviderId;
  packageDatasetSlots: GovernedClinicalReasoningDatasetSlot[];
  governance: typeof GOVERNED_CLINICAL_REASONING_DATASET_GOVERNANCE;
  metadata: GovernedClinicalReasoningDatasetMetadata;
};

export type GovernedClinicalReasoningDatasetBuilderResult = {
  source: "governed_clinical_reasoning_dataset";
  builderVersion: typeof GOVERNED_CLINICAL_REASONING_DATASET_VERSION;
  governedClinicalReasoningDataset: GovernedClinicalReasoningDataset;
  governance: typeof GOVERNED_CLINICAL_REASONING_DATASET_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
