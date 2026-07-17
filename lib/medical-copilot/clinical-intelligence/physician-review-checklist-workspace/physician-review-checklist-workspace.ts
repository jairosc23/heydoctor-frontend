/**
 * AI-36 — PhysicianReviewChecklistWorkspace contracts (frontend).
 */

export const PHYSICIAN_REVIEW_CHECKLIST_WORKSPACE_VERSION = "1.0.0" as const;

export const PHYSICIAN_REVIEW_CHECKLIST_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type PhysicianReviewChecklistWorkspaceSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "checklist_view_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type PhysicianReviewChecklistWorkspaceMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  physicianReviewPackageId: string;
  checklistId: string;
  generatedAt: string;
  builderVersion: typeof PHYSICIAN_REVIEW_CHECKLIST_WORKSPACE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type PhysicianReviewChecklistWorkspace = {
  checklistWorkspaceId: string;
  providerId: AiLayerProviderId;
  checklistViewSlots: PhysicianReviewChecklistWorkspaceSlot[];
  governance: typeof PHYSICIAN_REVIEW_CHECKLIST_WORKSPACE_GOVERNANCE;
  metadata: PhysicianReviewChecklistWorkspaceMetadata;
};

export type PhysicianReviewChecklistWorkspaceBuilderResult = {
  source: "physician_review_checklist_workspace";
  builderVersion: typeof PHYSICIAN_REVIEW_CHECKLIST_WORKSPACE_VERSION;
  checklistWorkspace: PhysicianReviewChecklistWorkspace;
  governance: typeof PHYSICIAN_REVIEW_CHECKLIST_WORKSPACE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
