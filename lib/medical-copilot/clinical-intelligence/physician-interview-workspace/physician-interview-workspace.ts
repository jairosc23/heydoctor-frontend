/**
 * AI-42 — PhysicianInterviewWorkspace contracts (frontend).
 */

export const PHYSICIAN_INTERVIEW_WORKSPACE_VERSION = "1.0.0" as const;

export const PHYSICIAN_INTERVIEW_WORKSPACE_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type AiLayerProviderId = "noop" | "openai";

export type PhysicianInterviewWorkspaceSlot = {
  id: string;
  sourceRefId: string | null;
  order: number;
  kind: "interview_view_slot";
  status: "ok" | "empty" | "rejected";
  slotKey: string;
};

export type PhysicianInterviewWorkspaceMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  planId: string;
  clinicalQuestionsId: string;
  reviewSessionId: string;
  generatedAt: string;
  builderVersion: typeof PHYSICIAN_INTERVIEW_WORKSPACE_VERSION;
  status: "ok" | "empty" | "rejected";
  slotCount: number;
  selectedProviderId: AiLayerProviderId;
};

export type PhysicianInterviewWorkspace = {
  interviewWorkspaceId: string;
  providerId: AiLayerProviderId;
  interviewSlots: PhysicianInterviewWorkspaceSlot[];
  governance: typeof PHYSICIAN_INTERVIEW_WORKSPACE_GOVERNANCE;
  metadata: PhysicianInterviewWorkspaceMetadata;
};

export type PhysicianInterviewWorkspaceBuilderResult = {
  source: "physician_interview_workspace";
  builderVersion: typeof PHYSICIAN_INTERVIEW_WORKSPACE_VERSION;
  interviewWorkspace: PhysicianInterviewWorkspace;
  governance: typeof PHYSICIAN_INTERVIEW_WORKSPACE_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
