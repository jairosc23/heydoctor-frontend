import { heydoctorApi } from "../heydoctor-api";

export type ConsultationSummaryResponse = {
  summary: string;
  suggestedDiagnosis: string[];
  improvedNotes: string;
};

const PATH = "/ai/consultation-summary";

export async function postConsultationSummary(
  consultationId: string,
  signal?: AbortSignal,
): Promise<ConsultationSummaryResponse> {
  return heydoctorApi.post<ConsultationSummaryResponse>(
    PATH,
    { consultationId },
    signal,
  );
}
