export type AiLayerProviderId = "noop" | "openai";
export const CLINICAL_REASONING_TRACE_VERSION = "1.0.0" as const;
export const CLINICAL_REASONING_TRACE_GOVERNANCE = {
  requiresPhysicianReview: true as const,
  executesAction: false as const,
  autoPersistedToEmr: false as const,
};
export type ClinicalReasoningTraceSlot = { id: string; sourceRefId: string | null; order: number; kind: "reasoning_trace_slot"; status: "ok" | "empty" | "rejected"; slotKey: string; };
export type ClinicalReasoningTraceMetadata = { sessionId: string; consultationId: string; patientId: string; planId: string;
  clinicalReasoningGraphId: string;
  reasoningExecutionContextId: string;
  generatedAt: string; builderVersion: typeof CLINICAL_REASONING_TRACE_VERSION; status: "ok" | "empty" | "rejected"; slotCount: number; selectedProviderId: AiLayerProviderId; };
export type ClinicalReasoningTrace = { clinicalReasoningTraceId: string; providerId: AiLayerProviderId; traceSlots: ClinicalReasoningTraceSlot[]; governance: typeof CLINICAL_REASONING_TRACE_GOVERNANCE; metadata: ClinicalReasoningTraceMetadata; };
export type ClinicalReasoningTraceBuilderResult = { source: "clinical_reasoning_trace"; builderVersion: typeof CLINICAL_REASONING_TRACE_VERSION; clinicalReasoningTrace: ClinicalReasoningTrace; governance: typeof CLINICAL_REASONING_TRACE_GOVERNANCE; reason: string | null; generatedAt: string; };
