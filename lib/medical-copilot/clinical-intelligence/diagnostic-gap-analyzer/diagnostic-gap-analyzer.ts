/**
 * AI-27 — DiagnosticGapAnalyzerResult contracts (frontend).
 */

export const DIAGNOSTIC_GAP_ANALYZER_VERSION = "1.0.0" as const;

export const DIAGNOSTIC_GAP_ANALYZER_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type DiagnosticGapAnalyzerResultSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "diagnostic_gap_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type DiagnosticGapAnalyzerResultMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  evidenceWorkspaceId: string;
  missingInformationId: string;
  contextId: string;
  generatedAt: string;
  builderVersion: typeof DIAGNOSTIC_GAP_ANALYZER_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type DiagnosticGapAnalyzerResult = {
  gapAnalyzerId: string;
  providerId: AiLayerProviderId;
  gapSlots: DiagnosticGapAnalyzerResultSlot[];
  governance: typeof DIAGNOSTIC_GAP_ANALYZER_GOVERNANCE;
  metadata: DiagnosticGapAnalyzerResultMetadata;
};

export type DiagnosticGapAnalyzerResultBuilderResult = {
  source: "diagnostic_gap_analyzer";
  builderVersion: typeof DIAGNOSTIC_GAP_ANALYZER_VERSION;
  gapAnalyzer: DiagnosticGapAnalyzerResult;
  governance: typeof DIAGNOSTIC_GAP_ANALYZER_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
