/**
 * Clinical Completion Workflow — independent of Encounter status.
 * Encounter remains: draft → in_progress → completed → signed → locked.
 *
 * ClinicalActId identifies one clinical act. CorrelationId is reserved for
 * observability/tracing and must not be used as the act identifier.
 */

export const CLINICAL_COMPLETION_STATES = [
  "pending",
  "emitted",
  "no_medication",
  "document_ready",
  "delivered",
] as const;

export type ClinicalCompletionState =
  (typeof CLINICAL_COMPLETION_STATES)[number];

export type ClinicalActId = string;

export type ClinicalCompletionDocumentKind =
  | "prescription"
  | "visit_summary"
  | null;

export type ClinicalActAuditChain = {
  clinicalActId: ClinicalActId;
  encounter: { consultationId: string; status: string };
  signature: { signedAt: string | null; habDecisionId: string | null };
  hab: { decisionId: string | null; actKind: "prescription_pre_emit" | null };
  authorize: { emissionId: string | null };
  emit: { performed: boolean; emissionId: string | null };
  prescription: {
    prescriptionId: string | null;
    validationCode: string | null;
    noMedication: boolean;
  };
  document: { kind: ClinicalCompletionDocumentKind };
  delivery: { deliveredAt: string | null };
};

export type ClinicalCompletionSnapshot = {
  clinicalActId: ClinicalActId;
  consultationId: string;
  /** Read-only mirror. Never written as Encounter status. */
  encounterStatus: string;
  state: ClinicalCompletionState;
  prescriptionId: string | null;
  emissionId: string | null;
  validationCode: string | null;
  documentKind: ClinicalCompletionDocumentKind;
  deliveredAt: string | null;
  signedAt: string | null;
  signatureHabDecisionId: string | null;
  emissionHabDecisionId: string | null;
  supersededBy: ClinicalActId | null;
  supersedes: ClinicalActId | null;
  updatedAt: string;
};

export const CLINICAL_COMPLETION_STATE_LABELS: Record<
  ClinicalCompletionState,
  string
> = {
  pending: "Pendiente",
  emitted: "Emitido",
  no_medication: "Sin medicación",
  document_ready: "Documento listo",
  delivered: "Entregado",
};

export function newClinicalActId(): ClinicalActId {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `act-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function isImmutableCompletionState(
  state: ClinicalCompletionState,
): boolean {
  return state === "document_ready" || state === "delivered";
}

export function createPendingSnapshot(
  consultationId: string,
  encounterStatus: string,
  extras: Partial<ClinicalCompletionSnapshot> = {},
): ClinicalCompletionSnapshot {
  return {
    clinicalActId: extras.clinicalActId ?? newClinicalActId(),
    consultationId,
    encounterStatus,
    prescriptionId: null,
    emissionId: null,
    validationCode: null,
    documentKind: null,
    deliveredAt: null,
    signedAt: null,
    signatureHabDecisionId: null,
    emissionHabDecisionId: null,
    supersededBy: null,
    supersedes: extras.supersedes ?? null,
    updatedAt: new Date().toISOString(),
    ...extras,
    state: extras.state ?? "pending",
  };
}

export function reconstructClinicalAct(
  snapshot: ClinicalCompletionSnapshot,
): ClinicalActAuditChain {
  return {
    clinicalActId: snapshot.clinicalActId,
    encounter: {
      consultationId: snapshot.consultationId,
      status: snapshot.encounterStatus,
    },
    signature: {
      signedAt: snapshot.signedAt,
      habDecisionId: snapshot.signatureHabDecisionId,
    },
    hab: {
      decisionId: snapshot.emissionHabDecisionId,
      actKind: snapshot.emissionHabDecisionId ? "prescription_pre_emit" : null,
    },
    authorize: { emissionId: snapshot.emissionId },
    emit: {
      performed: snapshot.state !== "pending" && snapshot.state !== "no_medication"
        ? snapshot.emissionId != null || snapshot.prescriptionId != null
        : snapshot.emissionId != null,
      emissionId: snapshot.emissionId,
    },
    prescription: {
      prescriptionId: snapshot.prescriptionId,
      validationCode: snapshot.validationCode,
      noMedication:
        snapshot.state === "no_medication" ||
        snapshot.documentKind === "visit_summary",
    },
    document: { kind: snapshot.documentKind },
    delivery: { deliveredAt: snapshot.deliveredAt },
  };
}
