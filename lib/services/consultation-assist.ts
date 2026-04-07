import { apiPost } from "../api-client";

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

export function requestConsultationAssist(
  body: ConsultationAssistRequest
): Promise<ConsultationAssistResponse> {
  return apiPost<ConsultationAssistResponse>(
    "/ai/consultation-assist",
    body
  );
}
