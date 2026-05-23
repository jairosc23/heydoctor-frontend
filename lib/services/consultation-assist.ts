import { getAccessToken } from "../auth-client";
import { getApiBase, apiFetch } from "../heydoctor-api";

export type ConsultationAssistRequest = {
  chiefComplaint?: string;
  symptoms?: string;
  notes?: string;
};

export type ConsultationAssistResponse = {
  aiRunId?: string;
  approvalState?: AiApprovalState;
  generatedByAi?: true;
  assistiveOnlyNotice: string;
  possibleDiagnoses: string[];
  recommendations: string[];
  generalEducation: string[];
};

export type AiApprovalState = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

export type AiProvenance = {
  aiRunId: string;
  workflowType: string;
  provider: string;
  modelName: string;
  promptVersionId: string;
  promptVersion: string | null;
  consultationId: string | null;
  appointmentId: string | null;
  requestingUserId: string;
  clinicId: string;
  approvalState: AiApprovalState;
  status: string;
  startedAt: string;
  completedAt: string | null;
  reviewedAt?: string | null;
  reviewerId?: string | null;
  correlationId: string | null;
};

/**
 * POST vía `/api/ai/consultation-assist` en el origen Next (proxy → Nest),
 * con Bearer en memoria si existe, para no depender solo de cookies cruzadas.
 */
export function requestConsultationAssist(
  body: ConsultationAssistRequest
): Promise<ConsultationAssistResponse> {
  const token = typeof window !== "undefined" ? getAccessToken()?.trim() : null;
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/ai/consultation-assist`
      : `${getApiBase()}/ai/consultation-assist`;

  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return apiFetch<ConsultationAssistResponse>(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  });
}

export function approveAiOutput(
  aiRunId: string,
  overrideReason?: string
): Promise<AiProvenance> {
  return apiFetch<AiProvenance>(`/ai/runs/${encodeURIComponent(aiRunId)}/approve`, {
    method: "POST",
    body: JSON.stringify({ overrideReason }),
  });
}

export function rejectAiOutput(
  aiRunId: string,
  rejectionReason: string
): Promise<AiProvenance> {
  return apiFetch<AiProvenance>(`/ai/runs/${encodeURIComponent(aiRunId)}/reject`, {
    method: "POST",
    body: JSON.stringify({ rejectionReason }),
  });
}

export function getAiProvenance(aiRunId: string): Promise<AiProvenance> {
  return apiFetch<AiProvenance>(
    `/ai/runs/${encodeURIComponent(aiRunId)}/provenance`
  );
}
