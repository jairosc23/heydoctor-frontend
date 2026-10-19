/**
 * AI-60 — GovernedClinicalReasoningInputPackage contracts (frontend).
 */
export const GOVERNED_CLINICAL_REASONING_INPUT_PACKAGE_VERSION = "1.0.0" as const;
export const GOVERNED_CLINICAL_REASONING_INPUT_PACKAGE_GOVERNANCE = { requiresPhysicianReview: true, executesAction: false, autoPersistedToEmr: false } as const;
export type AiLayerProviderId = "noop" | "openai";
export type GovernedClinicalReasoningInputPackageSlot = { id: string; sourceRefId: string | null; order: number; kind: "reasoning_input_package_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type GovernedClinicalReasoningInputPackageMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  governedReasoningPreparationId: string;
  governedClinicalReasoningDatasetId: string;
  clinicalReasoningPackageId: string;
  reviewSessionId: string;
  assessmentPackageId: string;
  generatedAt: string; builderVersion: typeof GOVERNED_CLINICAL_REASONING_INPUT_PACKAGE_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type GovernedClinicalReasoningInputPackage = { clinicalReasoningInputPackageId: string; providerId: AiLayerProviderId; inputPackageSlots: GovernedClinicalReasoningInputPackageSlot[]; governance: typeof GOVERNED_CLINICAL_REASONING_INPUT_PACKAGE_GOVERNANCE; metadata: GovernedClinicalReasoningInputPackageMetadata; };
export type GovernedClinicalReasoningInputPackageBuilderResult = { source: "governed_clinical_reasoning_input_package"; builderVersion: typeof GOVERNED_CLINICAL_REASONING_INPUT_PACKAGE_VERSION; clinicalReasoningInputPackage: GovernedClinicalReasoningInputPackage; governance: typeof GOVERNED_CLINICAL_REASONING_INPUT_PACKAGE_GOVERNANCE; reason: string | null; generatedAt: string; };
