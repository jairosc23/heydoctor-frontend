import { heydoctorApi } from "../heydoctor-api";
import type { ConsultationJourneySession, JourneyStage } from "./types";

const BASE = "/journey-orchestrator";

export async function startConsultationJourney(input: {
  consultationId: string;
  patientId: string;
}): Promise<ConsultationJourneySession> {
  const res = await heydoctorApi.post<{ data: ConsultationJourneySession }>(
    `${BASE}/session/start`,
    input,
  );
  return res.data;
}

export async function getConsultationJourney(
  consultationId: string,
): Promise<ConsultationJourneySession> {
  const res = await heydoctorApi.get<{ data: ConsultationJourneySession }>(
    `${BASE}/consultations/${encodeURIComponent(consultationId)}`,
  );
  return res.data;
}

export async function listLegalNextStages(
  consultationId: string,
): Promise<JourneyStage[]> {
  const res = await heydoctorApi.get<{ data: JourneyStage[] }>(
    `${BASE}/consultations/${encodeURIComponent(consultationId)}/legal-next`,
  );
  return res.data;
}

export async function advanceConsultationJourney(input: {
  consultationId: string;
  to: JourneyStage;
  reason?: string;
}): Promise<ConsultationJourneySession> {
  const res = await heydoctorApi.post<{ data: ConsultationJourneySession }>(
    `${BASE}/consultations/${encodeURIComponent(input.consultationId)}/advance`,
    { to: input.to, reason: input.reason },
  );
  return res.data;
}
