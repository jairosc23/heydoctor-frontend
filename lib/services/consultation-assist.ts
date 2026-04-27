import { getAccessToken } from "../auth-client";
import { getApiBase, apiFetch } from "../heydoctor-api";

export type ConsultationAssistRequest = {
  chiefComplaint?: string;
  symptoms?: string;
  notes?: string;
};

export type ConsultationAssistResponse = {
  assistiveOnlyNotice: string;
  possibleDiagnoses: string[];
  recommendations: string[];
  generalEducation: string[];
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
