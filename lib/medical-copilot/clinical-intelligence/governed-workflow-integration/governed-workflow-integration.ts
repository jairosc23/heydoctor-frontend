/**
 * AI-15 — GovernedWorkflowIntegration contracts (frontend).
 * Structural only — no LLM, clinical content, or side effects.
 */

export const GOVERNED_WORKFLOW_INTEGRATION_VERSION = "1.0.0" as const;

export const WORKFLOW_INTEGRATION_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedWorkflowIntegrationSlot = {
  id: string;
  sourceReviewItemId: string | null;
  order: number;
  kind: "integration_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedWorkflowIntegrationMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  executionId: string;
  responseId: string;
  promptId: string;
  templateId: string;
  composedPromptId: string;
  payloadId: string;
  invocationId: string;
  normalizedId: string;
  outputId: string;
  reviewPrepId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_WORKFLOW_INTEGRATION_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedWorkflowIntegration = {
  integrationId: string;
  providerId: AiLayerProviderId;
  integrationSlots: GovernedWorkflowIntegrationSlot[];
  governance: typeof WORKFLOW_INTEGRATION_GOVERNANCE;
  metadata: GovernedWorkflowIntegrationMetadata;
};

export type GovernedWorkflowIntegrationBuilderResult = {
  source: "governed_workflow_integration";
  builderVersion: typeof GOVERNED_WORKFLOW_INTEGRATION_VERSION;
  integration: GovernedWorkflowIntegration;
  governance: typeof WORKFLOW_INTEGRATION_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
