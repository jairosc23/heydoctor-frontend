export type AiLayerProviderId = "noop" | "openai";
export const CLINICAL_REASONING_ORCHESTRATOR_VERSION = "1.0.0" as const;
export const CLINICAL_REASONING_ORCHESTRATOR_GOVERNANCE = { requiresPhysicianReview: true as const, executesAction: false as const, autoPersistedToEmr: false as const };
export type ClinicalReasoningOrchestratorSlot = { id: string; sourceRefId: string | null; order: number; kind: "orchestrator_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ClinicalReasoningOrchestratorMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  clinicalReasoningPackageId: string;
  generatedAt: string; builderVersion: typeof CLINICAL_REASONING_ORCHESTRATOR_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ClinicalReasoningOrchestrator = { clinicalReasoningOrchestratorId: string; providerId: AiLayerProviderId; orchestratorSlots: ClinicalReasoningOrchestratorSlot[]; governance: typeof CLINICAL_REASONING_ORCHESTRATOR_GOVERNANCE; metadata: ClinicalReasoningOrchestratorMetadata; };
export type ClinicalReasoningOrchestratorBuilderResult = { source: "clinical_reasoning_orchestrator"; builderVersion: typeof CLINICAL_REASONING_ORCHESTRATOR_VERSION; clinicalReasoningOrchestrator: ClinicalReasoningOrchestrator; governance: typeof CLINICAL_REASONING_ORCHESTRATOR_GOVERNANCE; reason: string | null; generatedAt: string; };
