import { heydoctorApi } from "../heydoctor-api";

export type EmissionClass = "medication" | "order" | "clinical_document";

export type EmissionLifecycleState =
  | "assembling"
  | "ready_for_hab"
  | "blocked"
  | "awaiting_hab"
  | "authorized_pending_pe"
  | "pe_adapter_pending"
  | "emitted"
  | "failed"
  | "cancelled";

export type EmissionSourceRef = {
  sourceKind: "therapy_intent" | "order_intent" | "durable_document";
  sourceId: string;
  label: string;
  payload?: {
    medications?: Array<Record<string, unknown>>;
    diagnosis?: string;
    notes?: string;
  };
};

export type EmissionCandidateRecord = {
  emissionId: string;
  consultationId: string;
  state: EmissionLifecycleState;
  emissionClass: EmissionClass;
  habDecisionId: string | null;
  emissionPerformed: boolean;
  sources: EmissionSourceRef[];
  signatureReadiness?: string;
};

const BASE = "/emission-pipeline";

function unwrapRecord(raw: unknown): EmissionCandidateRecord {
  if (raw && typeof raw === "object" && "data" in raw) {
    return (raw as { data: EmissionCandidateRecord }).data;
  }
  return raw as EmissionCandidateRecord;
}

function unwrapList(raw: unknown): EmissionCandidateRecord[] {
  if (Array.isArray(raw)) return raw as EmissionCandidateRecord[];
  if (raw && typeof raw === "object" && "data" in raw) {
    const data = (raw as { data: unknown }).data;
    return Array.isArray(data) ? (data as EmissionCandidateRecord[]) : [];
  }
  return [];
}

export async function listEmissionsByConsultation(
  consultationId: string,
): Promise<EmissionCandidateRecord[]> {
  const raw = await heydoctorApi.get<unknown>(
    `${BASE}/consultations/${encodeURIComponent(consultationId)}`,
  );
  return unwrapList(raw);
}

export async function assembleEmissionCandidate(input: {
  consultationId: string;
  emissionClass: EmissionClass;
  sources: EmissionSourceRef[];
}): Promise<EmissionCandidateRecord> {
  const raw = await heydoctorApi.post<unknown>(
    `${BASE}/consultations/${encodeURIComponent(input.consultationId)}/assemble`,
    {
      emissionClass: input.emissionClass,
      sources: input.sources,
    },
  );
  return unwrapRecord(raw);
}

export async function markEmissionSignatureReady(
  emissionId: string,
  ready = true,
): Promise<EmissionCandidateRecord> {
  const raw = await heydoctorApi.post<unknown>(
    `${BASE}/${encodeURIComponent(emissionId)}/signature-readiness`,
    { ready },
  );
  return unwrapRecord(raw);
}

export async function authorizeEmission(
  emissionId: string,
  habDecisionId: string,
): Promise<EmissionCandidateRecord> {
  const raw = await heydoctorApi.post<unknown>(
    `${BASE}/${encodeURIComponent(emissionId)}/authorize`,
    { habDecisionId },
  );
  return unwrapRecord(raw);
}

export async function emitEmission(
  emissionId: string,
): Promise<EmissionCandidateRecord> {
  const raw = await heydoctorApi.post<unknown>(
    `${BASE}/${encodeURIComponent(emissionId)}/emit`,
  );
  return unwrapRecord(raw);
}

export function isEmitted(record: EmissionCandidateRecord): boolean {
  return record.emissionPerformed === true || record.state === "emitted";
}

export function isInFlight(record: EmissionCandidateRecord): boolean {
  if (record.state === "cancelled" || record.state === "failed") return false;
  if (isEmitted(record)) return false;
  return [
    "assembling",
    "ready_for_hab",
    "awaiting_hab",
    "authorized_pending_pe",
    "pe_adapter_pending",
  ].includes(record.state);
}
