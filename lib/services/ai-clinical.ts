import { apiPost } from "../api-client";

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
  return apiPost<ConsultationSummaryResponse>(PATH, body, signal);
}
