/**
 * AI-41 — ClinicalQuestionGeneratorResult contracts (frontend).
 */

export const CLINICAL_QUESTION_GENERATOR_VERSION = "1.0.0" as const;

export const CLINICAL_QUESTION_GENERATOR_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type ClinicalQuestionGeneratorResultSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "clinical_question_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type ClinicalQuestionGeneratorResultMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  reviewSessionId: string;
  contextId: string;
  missingInformationId: string;
  generatedAt: string;
  builderVersion: typeof CLINICAL_QUESTION_GENERATOR_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type ClinicalQuestionGeneratorResult = {
  clinicalQuestionsId: string;
  providerId: AiLayerProviderId;
  questionSlots: ClinicalQuestionGeneratorResultSlot[];
  governance: typeof CLINICAL_QUESTION_GENERATOR_GOVERNANCE;
  metadata: ClinicalQuestionGeneratorResultMetadata;
};

export type ClinicalQuestionGeneratorResultBuilderResult = {
  source: "clinical_question_generator";
  builderVersion: typeof CLINICAL_QUESTION_GENERATOR_VERSION;
  clinicalQuestions: ClinicalQuestionGeneratorResult;
  governance: typeof CLINICAL_QUESTION_GENERATOR_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
