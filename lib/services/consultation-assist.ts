import { heydoctorApi } from "../heydoctor-api";

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
  return heydoctorApi.post<ConsultationAssistResponse>(
    "/ai/consultation-assist",
    body
  );
}
