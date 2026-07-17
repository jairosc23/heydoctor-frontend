/**
 * AI-25 — PhysicianDecisionWorkspace contracts (frontend).
 */

export const PHYSICIAN_DECISION_WORKSPACE_VERSION = "1.0.0" as const;

export const PHYSICIAN_DECISION_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type PhysicianDecisionWorkspaceSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "workspace_view_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type PhysicianDecisionWorkspaceMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  contextId: string;
  findingRefId: string;
  insightRefId: string;
  recommendationRefId: string;
  reviewId: string;
  caseId: string;
  clinicalPlanId: string;
  responseId: string;
  differentialId: string;
  evidenceMappingId: string;
  confidenceId: string;
  missingInformationId: string;
  generatedAt: string;
  builderVersion: typeof PHYSICIAN_DECISION_WORKSPACE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type PhysicianDecisionWorkspace = {
  workspaceId: string;
  providerId: AiLayerProviderId;
  viewSlots: PhysicianDecisionWorkspaceSlot[];
  governance: typeof PHYSICIAN_DECISION_WORKSPACE_GOVERNANCE;
  metadata: PhysicianDecisionWorkspaceMetadata;
};

export type PhysicianDecisionWorkspaceBuilderResult = {
  source: "physician_decision_workspace";
  builderVersion: typeof PHYSICIAN_DECISION_WORKSPACE_VERSION;
  workspace: PhysicianDecisionWorkspace;
  governance: typeof PHYSICIAN_DECISION_WORKSPACE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
