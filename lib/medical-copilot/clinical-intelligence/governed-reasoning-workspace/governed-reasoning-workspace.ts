/**
 * AI-54 — GovernedReasoningWorkspace contracts (frontend).
 */

export const GOVERNED_REASONING_WORKSPACE_VERSION = "1.0.0" as const;

export const GOVERNED_REASONING_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type GovernedReasoningWorkspaceSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "governed_reasoning_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type GovernedReasoningWorkspaceMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  clinicalPatternWorkspaceId: string;
  physicianReasoningPreparationId: string;
  confidenceId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_REASONING_WORKSPACE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type GovernedReasoningWorkspace = {
  governedReasoningWorkspaceId: string;
  providerId: AiLayerProviderId;
  reasoningViewSlots: GovernedReasoningWorkspaceSlot[];
  governance: typeof GOVERNED_REASONING_WORKSPACE_GOVERNANCE;
  metadata: GovernedReasoningWorkspaceMetadata;
};

export type GovernedReasoningWorkspaceBuilderResult = {
  source: "governed_reasoning_workspace";
  builderVersion: typeof GOVERNED_REASONING_WORKSPACE_VERSION;
  governedReasoningWorkspace: GovernedReasoningWorkspace;
  governance: typeof GOVERNED_REASONING_WORKSPACE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
