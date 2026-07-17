export type AiLayerProviderId = "noop" | "openai";
export const REASONING_STATE_MACHINE_VERSION = "1.0.0" as const;
export const REASONING_STATE_MACHINE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};
export type ReasoningStateMachineSlot = { id: string; sourceRefId: string | null; order: number; kind: "state_machine_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ReasoningStateMachineMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  reasoningStageManagerId: string;
  generatedAt: string; builderVersion: typeof REASONING_STATE_MACHINE_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ReasoningStateMachine = { reasoningStateMachineId: string; providerId: AiLayerProviderId; stateSlots: ReasoningStateMachineSlot[]; governance: typeof REASONING_STATE_MACHINE_GOVERNANCE; metadata: ReasoningStateMachineMetadata; };
export type ReasoningStateMachineBuilderResult = { source: "reasoning_state_machine"; builderVersion: typeof REASONING_STATE_MACHINE_VERSION; reasoningStateMachine: ReasoningStateMachine; governance: typeof REASONING_STATE_MACHINE_GOVERNANCE; reason: string | null; generatedAt: string; };
