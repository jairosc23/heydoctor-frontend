/**
 * AI-15 — Frontend mapper for GovernedWorkflowIntegration.
 */

import {
  WORKFLOW_INTEGRATION_GOVERNANCE,
  type GovernedWorkflowIntegration,
  type GovernedWorkflowIntegrationBuilderResult,
  type GovernedWorkflowIntegrationSlot,
  type AiLayerProviderId,
} from "./governed-workflow-integration";

export function mapGovernedWorkflowIntegrationEnvelope(
  payload: unknown,
): GovernedWorkflowIntegrationBuilderResult | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;

  const resultObj =
    root.source === "governed_workflow_integration"
      ? root
      : root.integration &&
          typeof root.integration === "object" &&
          (root.integration as { source?: string }).source === "governed_workflow_integration"
        ? (root.integration as Record<string, unknown>)
        : null;

  if (!resultObj) return null;

  const mapped = mapGovernedWorkflowIntegration(resultObj.integration);
  if (!mapped) return null;

  return {
    source: "governed_workflow_integration",
    builderVersion: "1.0.0",
    integration: mapped,
    governance: { ...WORKFLOW_INTEGRATION_GOVERNANCE },
    reason: typeof resultObj.reason === "string" ? resultObj.reason : null,
    generatedAt:
      typeof resultObj.generatedAt === "string"
        ? resultObj.generatedAt
        : new Date().toISOString(),
  };
}

export function mapGovernedWorkflowIntegration(raw: unknown): GovernedWorkflowIntegration | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.providerId !== "noop" && r.providerId !== "openai") return null;
  if (typeof r.integrationId !== "string" || !String(r.integrationId).trim()) return null;
  if (!Array.isArray(r.integrationSlots)) return null;
  if (!r.metadata || typeof r.metadata !== "object") return null;

  const slots = r.integrationSlots
    .map(mapSlot)
    .filter((slot): slot is GovernedWorkflowIntegrationSlot => slot !== null);

  const meta = r.metadata as Record<string, unknown>;
  const providerId = r.providerId as AiLayerProviderId;
  const selected =
    meta.selectedProviderId === "noop" || meta.selectedProviderId === "openai"
      ? meta.selectedProviderId
      : providerId;
  const status =
    meta.status === "ok" || meta.status === "empty" || meta.status === "rejected"
      ? meta.status
      : "empty";

  return {
    integrationId: String(r.integrationId).trim(),
    providerId,
    integrationSlots: slots,
    governance: { ...WORKFLOW_INTEGRATION_GOVERNANCE },
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
      payloadId: String(meta.payloadId ?? ""),
      invocationId: String(meta.invocationId ?? ""),
      normalizedId: String(meta.normalizedId ?? ""),
      outputId: String(meta.outputId ?? ""),
      reviewPrepId: String(meta.reviewPrepId ?? ""),
      generatedAt:
        typeof meta.generatedAt === "string"
          ? meta.generatedAt
          : new Date().toISOString(),
      builderVersion: "1.0.0",
      status,
      slotCount:
        typeof meta.slotCount === "number" ? meta.slotCount : slots.length,
      selectedProviderId: selected,
    },
  };
}

function mapSlot(raw: unknown): GovernedWorkflowIntegrationSlot | null {
  if (!raw || typeof raw !== "object") return null;
  const slot = raw as Record<string, unknown>;
  if (typeof slot.id !== "string" || !slot.id.trim()) return null;
  if (typeof slot.order !== "number") return null;
  if (slot.kind !== "integration_slot") return null;
  if (slot.status !== "ok" && slot.status !== "empty" && slot.status !== "rejected") return null;
  if (typeof slot.slotKey !== "string") return null;

  return {
    id: slot.id.trim(),
    sourceReviewItemId:
      typeof slot.sourceReviewItemId === "string" ? slot.sourceReviewItemId : null,
    order: slot.order,
    kind: "integration_slot",
    status: slot.status,
    slotKey: slot.slotKey,
  };
}
