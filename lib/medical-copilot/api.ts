import { heydoctorApi } from "../heydoctor-api";
import type {
  CreateMedicalCopilotSessionData,
  CreateMedicalCopilotSessionPayload,
  MedicalCopilotActionSummary,
  MedicalCopilotApiEnvelope,
  MedicalCopilotMemorySummary,
  MedicalCopilotSessionSummary,
  MedicalCopilotTimelineSummary,
  MedicalCopilotWorkspaceSummary,
} from "./types";

const BASE = "/medical-copilot";

/**
 * CP-24 Medical Copilot Facade API client.
 * Consumes only `/medical-copilot/*` public endpoints.
 */
export async function createMedicalCopilotSession(
  payload: CreateMedicalCopilotSessionPayload,
): Promise<MedicalCopilotApiEnvelope<CreateMedicalCopilotSessionData>> {
  return heydoctorApi.post(`${BASE}/session`, payload);
}

export async function getMedicalCopilotSession(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ session: MedicalCopilotSessionSummary }>> {
  return heydoctorApi.get(`${BASE}/session/${encodeURIComponent(sessionId)}`);
}

export async function getMedicalCopilotWorkspace(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ workspace: MedicalCopilotWorkspaceSummary }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/workspace`,
  );
}

export async function getMedicalCopilotTimeline(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ timeline: MedicalCopilotTimelineSummary }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/timeline`,
  );
}

export async function getMedicalCopilotMemory(
  sessionId: string,
): Promise<MedicalCopilotApiEnvelope<{ memory: MedicalCopilotMemorySummary }>> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/memory`,
  );
}

export async function getMedicalCopilotActions(
  sessionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ actions: MedicalCopilotActionSummary[] }>
> {
  return heydoctorApi.get(
    `${BASE}/session/${encodeURIComponent(sessionId)}/actions`,
  );
}

export async function approveMedicalCopilotAction(
  actionId: string,
): Promise<
  MedicalCopilotApiEnvelope<{ action: MedicalCopilotActionSummary }>
> {
  return heydoctorApi.post(
    `${BASE}/actions/${encodeURIComponent(actionId)}/approve`,
  );
}

export async function rejectMedicalCopilotAction(
  actionId: string,
  reason?: string,
): Promise<
  MedicalCopilotApiEnvelope<{ action: MedicalCopilotActionSummary }>
> {
  return heydoctorApi.post(
    `${BASE}/actions/${encodeURIComponent(actionId)}/reject`,
    reason ? { reason } : {},
  );
}
