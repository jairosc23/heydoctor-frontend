/**
 * CP-24 — Public Facade API contracts for Medical Copilot.
 * Presentation layer only — mirrors backend envelope, never Core internals.
 */

export const MEDICAL_COPILOT_API_VERSION = "v1" as const;

export type MedicalCopilotGovernance = {
  requiresPhysicianReview: true;
  executesAction: false;
  autoPersistedToEmr: false;
};

export type MedicalCopilotApiStatus =
  | "ok"
  | "not_found"
  | "invalid_transition"
  | "rejected"
  | "skipped";

export type MedicalCopilotApiEnvelope<T> = {
  source: "medical_copilot_facade";
  apiVersion: typeof MEDICAL_COPILOT_API_VERSION;
  status: MedicalCopilotApiStatus;
  data: T;
  governance: MedicalCopilotGovernance;
  reason: string | null;
  generatedAt: string;
};

export type MedicalCopilotSessionSummary = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MedicalCopilotWorkspaceSummary = {
  workspaceId: string;
  sessionId: string;
  status?: string;
  artifacts?: Array<{
    artifactId: string;
    artifactType: string;
    status: string;
    version: number;
    sourceSkill?: string | null;
    createdAt?: string;
  }>;
};

export type MedicalCopilotTimelineEntry = {
  timelineEntryId: string;
  timestamp: string;
  eventType: string;
  summary: string;
  artifactId?: string | null;
  skillId?: string | null;
};

export type MedicalCopilotTimelineSummary = {
  timelineId: string;
  sessionId: string;
  status?: string;
  entries?: MedicalCopilotTimelineEntry[];
};

export type MedicalCopilotMemoryEntry = {
  entryId: string;
  timestamp: string;
  memoryType: string;
  summary: string;
  artifactId?: string | null;
};

export type MedicalCopilotMemorySummary = {
  memoryId: string;
  sessionId: string;
  status?: string;
  entries?: MedicalCopilotMemoryEntry[];
};

export type MedicalCopilotActionSummary = {
  actionId: string;
  actionType: string;
  status: string;
  priority?: string;
  summary?: string;
  requiresPhysicianApproval?: boolean;
  artifactId?: string | null;
  skillId?: string | null;
};

export type CreateMedicalCopilotSessionPayload = {
  consultationId: string;
  patientId: string;
  appointmentId?: string;
};

export type CreateMedicalCopilotSessionData = {
  session: MedicalCopilotSessionSummary;
  workspace: MedicalCopilotWorkspaceSummary;
  memory: MedicalCopilotMemorySummary;
  timeline: MedicalCopilotTimelineSummary;
};

export const MEDICAL_COPILOT_GOVERNANCE: MedicalCopilotGovernance = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
};
