import {
  AI_RESPONSE_PROCESSING_GOVERNANCE,
  type GovernedProcessedAIResponse,
  type GovernedProcessedAIResponseBuilderResult,
  type GovernedProcessedAIResponseSlot,
  type AiLayerProviderId,
} from "./governed-ai-response-processing";

export function mapGovernedProcessedAIResponseEnvelope(payload: unknown): GovernedProcessedAIResponseBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "governed_ai_response_processing"
      ? root
      : root.processed && typeof root.processed === "object" &&
          (root.processed as { source?: string }).source === "governed_ai_response_processing"
        ? (root.processed as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapGovernedProcessedAIResponse(resultObj.processed);
  if (!mapped) return null;
  return {
    source: "governed_ai_response_processing",
    builderVersion: "1.0.0",
    processed: mapped,
    governance: { ...AI_RESPONSE_PROCESSING_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapGovernedProcessedAIResponse(raw: unknown): GovernedProcessedAIResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.processedId !== "string" || !String(r.processedId).trim()) return null;
  if (!Array.isArray(r.processedSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.processedSlots.map(mapSlot).filter((s): s is GovernedProcessedAIResponseSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    processedId: String(r.processedId).trim(),
    providerId,
    processedSlots: slots,
    governance: { ...AI_RESPONSE_PROCESSING_GOVERNANCE },
    metadata: {
      sessionId: String(meta.sessionId ?? ""),
      consultationId: String(meta.consultationId ?? ""),
      patientId: String(meta.patientId ?? ""),
      planId: String(meta.planId ?? ""),
      executionId: String(meta.executionId ?? ""),
      responseId: String(meta.responseId ?? ""),
      promptId: String(meta.promptId ?? ""),
      templateId: String(meta.templateId ?? ""),
      composedPromptId: String(meta.composedPromptId ?? ""),
      assemblyId: String(meta.assemblyId ?? ""),
      translationId: String(meta.translationId ?? ""),
      providerExecutionId: String(meta.providerExecutionId ?? ""),
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): GovernedProcessedAIResponseSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "processed_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "processed_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
