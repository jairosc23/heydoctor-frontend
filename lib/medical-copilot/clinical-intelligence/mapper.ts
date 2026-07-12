/**
 * CP-33 — Maps Medical Copilot Facade DTOs → ClinicalAnalysis frontend contracts.
 * No clinical interpretation; presentation mapping only.
 */

import { MEDICAL_COPILOT_GOVERNANCE } from "../types";
import type {
  MedicalCopilotActionSummary,
  MedicalCopilotApiEnvelope,
  MedicalCopilotMemorySummary,
  MedicalCopilotSessionSummary,
  MedicalCopilotTimelineSummary,
  MedicalCopilotWorkspaceSummary,
} from "../types";
import {
  CLINICAL_INTELLIGENCE_ADAPTER_VERSION,
  type ClinicalAnalysisActionItem,
  type ClinicalAnalysisFinding,
  type ClinicalAnalysisResponse,
} from "./types";

export type FacadeSnapshot = {
  session: MedicalCopilotApiEnvelope<{ session: MedicalCopilotSessionSummary }>;
  workspace: MedicalCopilotApiEnvelope<{
    workspace: MedicalCopilotWorkspaceSummary;
  }>;
  timeline: MedicalCopilotApiEnvelope<{
    timeline: MedicalCopilotTimelineSummary;
  }>;
  memory: MedicalCopilotApiEnvelope<{ memory: MedicalCopilotMemorySummary }>;
  actions: MedicalCopilotApiEnvelope<{
    actions: MedicalCopilotActionSummary[];
  }>;
};

function mapActionToFinding(
  action: MedicalCopilotActionSummary,
): ClinicalAnalysisFinding {
  return {
    findingId: `finding_action_${action.actionId}`,
    kind: "action",
    title: action.actionType || "action",
    summary: action.summary?.trim() || action.actionType || "Acción clínica sugerida",
    sourceId: action.actionId,
    requiresPhysicianReview: true,
  };
}

function mapTimelineFinding(
  entry: {
    timelineEntryId: string;
    eventType: string;
    summary: string;
  },
): ClinicalAnalysisFinding {
  return {
    findingId: `finding_timeline_${entry.timelineEntryId}`,
    kind: "timeline",
    title: entry.eventType || "timeline",
    summary: entry.summary?.trim() || entry.eventType || "Evento de timeline",
    sourceId: entry.timelineEntryId,
    requiresPhysicianReview: true,
  };
}

function mapMemoryFinding(entry: {
  entryId: string;
  memoryType: string;
  summary: string;
}): ClinicalAnalysisFinding {
  return {
    findingId: `finding_memory_${entry.entryId}`,
    kind: "memory",
    title: entry.memoryType || "memory",
    summary: entry.summary?.trim() || entry.memoryType || "Entrada de memoria",
    sourceId: entry.entryId,
    requiresPhysicianReview: true,
  };
}

export function mapActionToAnalysisItem(
  action: MedicalCopilotActionSummary,
): ClinicalAnalysisActionItem {
  return {
    actionId: action.actionId,
    actionType: action.actionType,
    status: action.status,
    summary: action.summary?.trim() || action.actionType || "",
    priority: action.priority ?? null,
    requiresPhysicianApproval: true,
    skillId: action.skillId ?? null,
    artifactId: action.artifactId ?? null,
  };
}

export function mapFacadeSnapshotToAnalysisResponse(
  snapshot: FacadeSnapshot,
  analysisId: string,
  generatedAt: string = new Date().toISOString(),
): ClinicalAnalysisResponse {
  const session = snapshot.session.data.session;
  const workspace = snapshot.workspace.data.workspace;
  const timeline = snapshot.timeline.data.timeline;
  const memory = snapshot.memory.data.memory;
  const actions = snapshot.actions.data.actions ?? [];

  const findings: ClinicalAnalysisFinding[] = [
    ...actions.map(mapActionToFinding),
    ...(timeline.entries ?? []).map(mapTimelineFinding),
    ...(memory.entries ?? []).map(mapMemoryFinding),
  ];

  if ((workspace.artifacts?.length ?? 0) > 0) {
    findings.push({
      findingId: `finding_workspace_${workspace.workspaceId}`,
      kind: "workspace",
      title: "workspace",
      summary: `${workspace.artifacts!.length} artefacto(s) en workspace`,
      sourceId: workspace.workspaceId,
      requiresPhysicianReview: true,
    });
  }

  const facadeStatuses = {
    session: snapshot.session.status,
    workspace: snapshot.workspace.status,
    timeline: snapshot.timeline.status,
    memory: snapshot.memory.status,
    actions: snapshot.actions.status,
  };

  const allOk = Object.values(facadeStatuses).every((s) => s === "ok");
  const anyOk = Object.values(facadeStatuses).some((s) => s === "ok");
  const hasContent =
    findings.length > 0 ||
    actions.length > 0 ||
    (workspace.artifacts?.length ?? 0) > 0;

  let status: ClinicalAnalysisResponse["status"] = "empty";
  if (hasContent && allOk) status = "completed";
  else if (hasContent || anyOk) status = "partial";

  return {
    analysisId,
    session: {
      sessionId: session.sessionId,
      consultationId: session.consultationId,
      patientId: session.patientId,
      status: session.status ?? null,
    },
    status,
    findings,
    actions: actions.map(mapActionToAnalysisItem),
    workspaceArtifactCount: workspace.artifacts?.length ?? 0,
    timelineEntryCount: timeline.entries?.length ?? 0,
    memoryEntryCount: memory.entries?.length ?? 0,
    governance: {
      ...MEDICAL_COPILOT_GOVERNANCE,
      source: "medical_copilot_facade",
      adapterVersion: CLINICAL_INTELLIGENCE_ADAPTER_VERSION,
    },
    reason: allOk
      ? null
      : "Respuesta parcial: uno o más recursos de la Facade no respondieron ok",
    generatedAt,
    facadeStatuses,
  };
}
