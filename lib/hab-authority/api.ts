import { heydoctorApi } from "../heydoctor-api";

export type HabDecisionKind = "confirm" | "reject" | "modify" | "abort";

export type HabActKind =
  | "irreversible_clinical_stub"
  | "documentation_finalize"
  | "therapy_ready"
  | "orders_ready"
  | "prescription_pre_emit"
  | "generic_authority";

export type HabDecisionRecord = {
  decisionId: string;
  kind: HabDecisionKind;
  actKind: HabActKind;
  actRef: string | null;
  consultationId: string;
  patientId: string | null;
  clinicId: string;
  actorUserId: string;
  actorRole: string;
  rationale: string | null;
  modificationSummary: string | null;
  authorityChannel: "human_authority_boundary";
  emissionPerformed: false;
  clinicalPersistencePerformed: false;
  consumedAt: string | null;
  createdAt: string;
};

const BASE = "/hab-authority";

export async function submitHabDecision(input: {
  consultationId: string;
  kind: HabDecisionKind;
  actKind?: HabActKind;
  rationale?: string;
  modificationSummary?: string;
}): Promise<HabDecisionRecord> {
  const res = await heydoctorApi.post<{ data: HabDecisionRecord }>(
    `${BASE}/decisions`,
    input,
  );
  return res.data;
}

export async function listHabDecisions(
  consultationId: string,
): Promise<HabDecisionRecord[]> {
  const res = await heydoctorApi.get<{ data: HabDecisionRecord[] }>(
    `${BASE}/consultations/${encodeURIComponent(consultationId)}/decisions`,
  );
  return res.data;
}

export async function confirmEmitClassForPersist(input: {
  consultationId?: string | null;
  actKind: HabActKind;
}): Promise<string> {
  const consultationId = input.consultationId?.trim();
  if (!consultationId) {
    throw new Error(
      "Se requiere una consulta para emitir. Confirme autoridad (HAB) desde el encuentro.",
    );
  }
  const hab = await submitHabDecision({
    consultationId,
    kind: "confirm",
    actKind: input.actKind,
  });
  return hab.decisionId;
}
