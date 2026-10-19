/**
 * AI-43 — ClinicalCompletenessAnalyzerResult contracts (frontend).
 */

export const CLINICAL_COMPLETENESS_ANALYZER_VERSION = "1.0.0" as const;

export const CLINICAL_COMPLETENESS_ANALYZER_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type ClinicalCompletenessAnalyzerResultSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "completeness_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type ClinicalCompletenessAnalyzerResultMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  interviewWorkspaceId: string;
  contextId: string;
  clinicalPlanId: string;
  structuralCompleteness: string;
  generatedAt: string;
  builderVersion: typeof CLINICAL_COMPLETENESS_ANALYZER_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type ClinicalCompletenessAnalyzerResult = {
  completenessId: string;
  providerId: AiLayerProviderId;
  completenessSlots: ClinicalCompletenessAnalyzerResultSlot[];
  governance: typeof CLINICAL_COMPLETENESS_ANALYZER_GOVERNANCE;
  metadata: ClinicalCompletenessAnalyzerResultMetadata;
};

export type ClinicalCompletenessAnalyzerResultBuilderResult = {
  source: "clinical_completeness_analyzer";
  builderVersion: typeof CLINICAL_COMPLETENESS_ANALYZER_VERSION;
  completeness: ClinicalCompletenessAnalyzerResult;
  governance: typeof CLINICAL_COMPLETENESS_ANALYZER_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
