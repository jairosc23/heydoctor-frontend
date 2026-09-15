import { getAccessToken } from "../auth-client";
import { getApiBase, apiFetch } from "../heydoctor-api";

export type ConsultationAssistRequest = {
  chiefComplaint?: string;
  symptoms?: string;
  notes?: string;
};

export type ConsultationAssistResponse = {
  aiRunId?: string;
  /** From AI Governance startRun / workflow spec. */
  promptVersion?: string | null;
  approvalState?: string;
  generatedByAi?: boolean;
  assistiveOnlyNotice: string;
  possibleDiagnoses: string[];
  recommendations: string[];
  generalEducation: string[];
};

/** Nest `/ai/consultation-assist` via `getApiBase()` (Railway when HD_API_EDGE is OFF). */
export function consultationAssistUrl(): string {
  return `${getApiBase().replace(/\/$/, "")}/ai/consultation-assist`;
}

/**
 * POST browser → Nest `/ai/consultation-assist`.
 * Same CORS/CSRF/Bearer path as other clinical POSTs (`getApiBase` + `apiFetch`).
 * Does not traverse a Vercel Next route handler.
 */
export function requestConsultationAssist(
  body: ConsultationAssistRequest,
): Promise<ConsultationAssistResponse> {
  const token = typeof window !== "undefined" ? getAccessToken()?.trim() : null;
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return apiFetch<ConsultationAssistResponse>(consultationAssistUrl(), {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  });
}
