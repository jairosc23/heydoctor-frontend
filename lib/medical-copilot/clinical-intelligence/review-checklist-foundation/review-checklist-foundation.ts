/**
 * AI-32 — ReviewChecklistFoundation contracts (frontend).
 */

export const REVIEW_CHECKLIST_FOUNDATION_VERSION = "1.0.0" as const;

export const REVIEW_CHECKLIST_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type ReviewChecklistFoundationSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "review_checklist_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type ReviewChecklistFoundationMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  reviewDatasetId: string;
  generatedAt: string;
  builderVersion: typeof REVIEW_CHECKLIST_FOUNDATION_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type ReviewChecklistFoundation = {
  checklistId: string;
  providerId: AiLayerProviderId;
  checklistSlots: ReviewChecklistFoundationSlot[];
  governance: typeof REVIEW_CHECKLIST_GOVERNANCE;
  metadata: ReviewChecklistFoundationMetadata;
};

export type ReviewChecklistFoundationBuilderResult = {
  source: "review_checklist_foundation";
  builderVersion: typeof REVIEW_CHECKLIST_FOUNDATION_VERSION;
  checklist: ReviewChecklistFoundation;
  governance: typeof REVIEW_CHECKLIST_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
