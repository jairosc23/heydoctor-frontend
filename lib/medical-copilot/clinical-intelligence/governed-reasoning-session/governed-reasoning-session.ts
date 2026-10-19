export type AiLayerProviderId = "noop" | "openai";
export const GOVERNED_REASONING_SESSION_VERSION = "1.0.0" as const;
export const GOVERNED_REASONING_SESSION_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};
export type GovernedReasoningSessionSlot = { id: string; sourceRefId: string | null; order: number; kind: "reasoning_session_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type GovernedReasoningSessionMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  reasoningValidationEngineId: string;
  governedReasoningRuntimeId: string;
  generatedAt: string; builderVersion: typeof GOVERNED_REASONING_SESSION_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type GovernedReasoningSession = { governedReasoningSessionId: string; providerId: AiLayerProviderId; sessionSlots: GovernedReasoningSessionSlot[]; governance: typeof GOVERNED_REASONING_SESSION_GOVERNANCE; metadata: GovernedReasoningSessionMetadata; };
export type GovernedReasoningSessionBuilderResult = { source: "governed_reasoning_session"; builderVersion: typeof GOVERNED_REASONING_SESSION_VERSION; governedReasoningSession: GovernedReasoningSession; governance: typeof GOVERNED_REASONING_SESSION_GOVERNANCE; reason: string | null; generatedAt: string; };
