/**
 * CI-6 — Clinical Copilot Snapshot contracts (frontend).
 * Orchestration of CI-1…CI-5 — no diagnoses, treatments, or EMR writes.
 */

export const CLINICAL_COPILOT_SNAPSHOT_ORCHESTRATOR_VERSION = "1.0.0" as const;

export const CLINICAL_COPILOT_SNAPSHOT_GOVERNANCE = {
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
} as const;

export type ClinicalCopilotSnapshotMetadata = {
  sessionId: string;
  consultationId: string;
  patientId: string;
  generatedAt: string;
  orchestratorVersion: typeof CLINICAL_COPILOT_SNAPSHOT_ORCHESTRATOR_VERSION;
  status: "ok" | "empty" | "partial";
  counts: {
    findings: number;
    insights: number;
    recommendations: number;
    decisions: number;
    reasoning: number;
  };
};

export type ClinicalCopilotSnapshotItem = {
  id: string;
  category?: string;
  summary: string;
  confidence?: number;
};

export type ClinicalCopilotSnapshot = {
  findings: ClinicalCopilotSnapshotItem[];
  insights: ClinicalCopilotSnapshotItem[];
  recommendations: ClinicalCopilotSnapshotItem[];
  decisions: ClinicalCopilotSnapshotItem[];
  reasoning: ClinicalCopilotSnapshotItem[];
  governance: typeof CLINICAL_COPILOT_SNAPSHOT_GOVERNANCE;
  metadata: ClinicalCopilotSnapshotMetadata;
};

export type ClinicalCopilotSnapshotResult = {
  source: "clinical_copilot_snapshot_orchestrator";
  orchestratorVersion: typeof CLINICAL_COPILOT_SNAPSHOT_ORCHESTRATOR_VERSION;
  snapshot: ClinicalCopilotSnapshot;
  governance: typeof CLINICAL_COPILOT_SNAPSHOT_GOVERNANCE;
  reason: string | null;
  generatedAt: string;
};
