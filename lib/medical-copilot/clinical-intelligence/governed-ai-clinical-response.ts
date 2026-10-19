/**
 * AI-6 — Governed AI Clinical Response contracts (frontend).
 * Structural output contract only — no LLM, SDKs, or clinical side effects.
 */

export const GOVERNED_AI_CLINICAL_RESPONSE_VERSION = "1.0.0" as const;

export const CLINICAL_RESPONSE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type ClinicalResponseProviderId = "noop" | "openai";

export type GovernedAIClinicalResponseItem = {
  id: string;
  sourceExecutionId: string;
  order: number;
  kind: "execution_ack";
  status: "ok" | "empty" | "rejected";
  summary: string;
};

export type GovernedAIClinicalResponseMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  executionId: string;
  generatedAt: string;
  builderVersion: typeof GOVERNED_AI_CLINICAL_RESPONSE_VERSION;
  status: "ok" | "empty" | "rejected";
  itemCount: number;
  selectedProviderId: ClinicalResponseProviderId;
};

/** Public GovernedAIClinicalResponse — ONLY these fields. */
export type GovernedAIClinicalResponse = {
  responseId: string;
  providerId: ClinicalResponseProviderId;
  responseItems: GovernedAIClinicalResponseItem[];
  governance: typeof CLINICAL_RESPONSE_GOVERNANCE;
  metadata: GovernedAIClinicalResponseMetadata;
};

export type GovernedAIClinicalResponseBuilderResult = {
  source: "governed_ai_clinical_response";
  builderVersion: typeof GOVERNED_AI_CLINICAL_RESPONSE_VERSION;
  response: GovernedAIClinicalResponse;
  governance: typeof CLINICAL_RESPONSE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
