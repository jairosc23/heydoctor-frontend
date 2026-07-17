/**
 * AI-24 — MissingInformationEngineResult contracts (frontend).
 */

export const MISSING_INFORMATION_ENGINE_VERSION = "1.0.0" as const;

export const MISSING_INFORMATION_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type MissingInformationEngineResultSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "missing_information_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type MissingInformationEngineResultMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  differentialId: string;
  confidenceId: string;
  evidenceMappingId: string;
  generatedAt: string;
  builderVersion: typeof MISSING_INFORMATION_ENGINE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type MissingInformationEngineResult = {
  missingInformationId: string;
  providerId: AiLayerProviderId;
  missingSlots: MissingInformationEngineResultSlot[];
  governance: typeof MISSING_INFORMATION_GOVERNANCE;
  metadata: MissingInformationEngineResultMetadata;
};

export type MissingInformationEngineResultBuilderResult = {
  source: "missing_information_engine";
  builderVersion: typeof MISSING_INFORMATION_ENGINE_VERSION;
  missingInformation: MissingInformationEngineResult;
  governance: typeof MISSING_INFORMATION_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
