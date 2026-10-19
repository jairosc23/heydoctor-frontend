export type AiLayerProviderId = "noop" | "openai";
export const GOVERNED_CLINICAL_REASONING_SESSION_VERSION = "1.0.0" as const;
export const GOVERNED_CLINICAL_REASONING_SESSION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};
export type GovernedClinicalReasoningSessionSlot = { id: string; sourceRefId: string | null; order: number; kind: "clinical_reasoning_session_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type GovernedClinicalReasoningSessionMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  clinicalReasoningTraceId: string;
  governedReasoningSessionId: string;
  generatedAt: string; builderVersion: typeof GOVERNED_CLINICAL_REASONING_SESSION_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type GovernedClinicalReasoningSession = { governedClinicalReasoningSessionId: string; providerId: AiLayerProviderId; sessionSlots: GovernedClinicalReasoningSessionSlot[]; governance: typeof GOVERNED_CLINICAL_REASONING_SESSION_GOVERNANCE; metadata: GovernedClinicalReasoningSessionMetadata; };
export type GovernedClinicalReasoningSessionBuilderResult = { source: "governed_clinical_reasoning_session"; builderVersion: typeof GOVERNED_CLINICAL_REASONING_SESSION_VERSION; governedClinicalReasoningSession: GovernedClinicalReasoningSession; governance: typeof GOVERNED_CLINICAL_REASONING_SESSION_GOVERNANCE; reason: string | null; generatedAt: string; };
