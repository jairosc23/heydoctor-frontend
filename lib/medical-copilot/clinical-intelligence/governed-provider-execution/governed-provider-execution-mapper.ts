import {
  PROVIDER_EXECUTION_GOVERNANCE,
  type GovernedProviderExecutionResult,
  type GovernedProviderExecutionResultBuilderResult,
  type GovernedProviderExecutionResultSlot,
  type AiLayerProviderId,
} from "./governed-provider-execution";

export function mapGovernedProviderExecutionResultEnvelope(payload: unknown): GovernedProviderExecutionResultBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  const resultObj =
    root.source === "governed_provider_execution"
      ? root
      : root.providerExecution && typeof root.providerExecution === "object" &&
          (root.providerExecution as { source?: string }).source === "governed_provider_execution"
        ? (root.providerExecution as Record<string, unknown>)
        : null;
  if (!resultObj) return null;
  const mapped = mapGovernedProviderExecutionResult(resultObj.providerExecution);
  if (!mapped) return null;
  return {
    source: "governed_provider_execution",
    builderVersion: "1.0.0",
    providerExecution: mapped,
    governance: { ...PROVIDER_EXECUTION_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt: typeof resultObj.generatedAt === "string" ? resultObj.generatedAt : new Date().toISOString(),
  };
}

export function mapGovernedProviderExecutionResult(raw: unknown): GovernedProviderExecutionResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.providerExecutionId !== "string" || !String(r.providerExecutionId).trim()) return null;
  if (!Array.isArray(r.executionSlots) || !r.metadata || typeof r.metadata !== "object") return null;
  const slots = r.executionSlots.map(mapSlot).filter((s): s is GovernedProviderExecutionResultSlot => s !== null);
  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected = meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai" ? meta.selectedProviderId : providerId;
  const status = meta.status === "ok" || meta.status === "empty" || meta.status === "rejected" ? meta.status : "empty";
  return {
    providerExecutionId: String(r.providerExecutionId).trim(),
    providerId,
    executionSlots: slots,
    governance: { ...PROVIDER_EXECUTION_GOVERNANCE },
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
      generatedAt: typeof meta.generatedAt === "string" ? meta.generatedAt : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount: typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): GovernedProviderExecutionResultSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number" || slot.kind !== "provider_execution_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;
  return {
    id: slot.id.trim(),
    sourceRefId: typeof slot.sourceRefId === "string" ? slot.sourceRefId : null,
    order: slot.order,
    kind: "provider_execution_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
