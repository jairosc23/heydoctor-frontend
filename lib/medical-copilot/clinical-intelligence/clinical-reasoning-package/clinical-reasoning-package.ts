export type AiLayerProviderId = "noop" | "openai";
export const CLINICAL_REASONING_PACKAGE_VERSION = "1.0.0" as const;
export const CLINICAL_REASONING_PACKAGE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};
export type ClinicalReasoningPackageSlot = { id: string; sourceRefId: string | null; order: number; kind: "reasoning_package_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ClinicalReasoningPackageMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  governedClinicalReasoningSessionId: string;
  clinicalReasoningRuntimeFoundationId: string;
  generatedAt: string; builderVersion: typeof CLINICAL_REASONING_PACKAGE_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ClinicalReasoningPackage = { clinicalReasoningPackageId: string; providerId: AiLayerProviderId; packageSlots: ClinicalReasoningPackageSlot[]; governance: typeof CLINICAL_REASONING_PACKAGE_GOVERNANCE; metadata: ClinicalReasoningPackageMetadata; };
export type ClinicalReasoningPackageBuilderResult = { source: "clinical_reasoning_package"; builderVersion: typeof CLINICAL_REASONING_PACKAGE_VERSION; clinicalReasoningPackage: ClinicalReasoningPackage; governance: typeof CLINICAL_REASONING_PACKAGE_GOVERNANCE; reason: string | null; generatedAt: string; };
