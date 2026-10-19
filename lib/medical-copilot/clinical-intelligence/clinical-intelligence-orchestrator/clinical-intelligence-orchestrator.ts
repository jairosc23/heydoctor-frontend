export type AiLayerProviderId = "noop" | "openai";
export const CLINICAL_INTELLIGENCE_ORCHESTRATOR_VERSION = "1.0.0" as const;
export const CLINICAL_INTELLIGENCE_ORCHESTRATOR_GOVERNANCE = { requiresPhysicianReview: true as const, executesAction: false as const, autoPersistedToEmr: false as const };
export type ClinicalIntelligenceOrchestratorSlot = { id: string; sourceRefId: string | null; order: number; kind: "ci_orchestrator_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ClinicalIntelligenceOrchestratorMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  governedClinicalIntelligencePackageId: string;
  generatedAt: string; builderVersion: typeof CLINICAL_INTELLIGENCE_ORCHESTRATOR_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ClinicalIntelligenceOrchestrator = { clinicalIntelligenceOrchestratorId: string; providerId: AiLayerProviderId; orchestratorSlots: ClinicalIntelligenceOrchestratorSlot[]; governance: typeof CLINICAL_INTELLIGENCE_ORCHESTRATOR_GOVERNANCE; metadata: ClinicalIntelligenceOrchestratorMetadata; };
export type ClinicalIntelligenceOrchestratorBuilderResult = { source: "clinical_intelligence_orchestrator"; builderVersion: typeof CLINICAL_INTELLIGENCE_ORCHESTRATOR_VERSION; clinicalIntelligenceOrchestrator: ClinicalIntelligenceOrchestrator; governance: typeof CLINICAL_INTELLIGENCE_ORCHESTRATOR_GOVERNANCE; reason: string | null; generatedAt: string; };
