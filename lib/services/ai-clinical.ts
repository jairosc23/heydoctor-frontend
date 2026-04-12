import { heydoctorApi } from "../heydoctor-api";

export type ConsultationSummaryRequest = {
  reason: string;
  notes: string;
  diagnosis: string;
  treatment: string;
  patientAge?: string;
  patientSex?: string;
  priorNotesExcerpt?: string;
};

export type ConsultationSummaryResponse = {
  summary: string;
  suggestedDiagnosis: string[];
  improvedNotes: string;
};

const PATH = "/ai/consultation-summary";

export async function postConsultationSummary(
  body: ConsultationSummaryRequest,
  signal?: AbortSignal
): Promise<ConsultationSummaryResponse> {
  return heydoctorApi.post<ConsultationSummaryResponse>(PATH, body, signal);
}
