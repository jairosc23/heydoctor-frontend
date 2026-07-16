/**
 * AI-53 — ClinicalPatternWorkspace contracts (frontend).
 */

export const CLINICAL_PATTERN_WORKSPACE_VERSION = "1.0.0" as const;

export const CLINICAL_PATTERN_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type ClinicalPatternWorkspaceSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "clinical_pattern_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type ClinicalPatternWorkspaceMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  evidenceCorrelationWorkspaceId: string;
  contextId: string;
  clinicalPlanId: string;
  generatedAt: string;
  builderVersion: typeof CLINICAL_PATTERN_WORKSPACE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type ClinicalPatternWorkspace = {
  clinicalPatternWorkspaceId: string;
  providerId: AiLayerProviderId;
  patternSlots: ClinicalPatternWorkspaceSlot[];
  governance: typeof CLINICAL_PATTERN_WORKSPACE_GOVERNANCE;
  metadata: ClinicalPatternWorkspaceMetadata;
};

export type ClinicalPatternWorkspaceBuilderResult = {
  source: "clinical_pattern_workspace";
  builderVersion: typeof CLINICAL_PATTERN_WORKSPACE_VERSION;
  clinicalPatternWorkspace: ClinicalPatternWorkspace;
  governance: typeof CLINICAL_PATTERN_WORKSPACE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
