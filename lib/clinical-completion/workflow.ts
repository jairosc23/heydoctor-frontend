import { fetchClinicalDocumentPdf } from "../clinical-documents";
import {
  authorizeEmission,
  assembleEmissionCandidate,
  emitEmission,
  isEmitted,
  isInFlight,
  listEmissionsByConsultation,
  markEmissionSignatureReady,
  type EmissionCandidateRecord,
} from "../emission-pipeline/api";
import { listHabDecisions, submitHabDecision } from "../hab-authority/api";
import { fetchConsultation } from "../services/consultations";
import { fetchPatientById } from "../services/patients";
import {
  downloadPrescriptionPdf,
  fetchPrescriptionsByPatient,
  type PrescriptionRecord,
} from "../services/prescriptions";
import {
  loadClinicalActById,
  loadClinicalCompletionSnapshot,
  saveClinicalCompletionSnapshot,
} from "./store";
import {
  createPendingSnapshot,
  isImmutableCompletionState,
  reconstructClinicalAct,
  type ClinicalActAuditChain,
  type ClinicalActId,
  type ClinicalCompletionSnapshot,
} from "./types";

export type ClinicalCompletionPorts = {
  fetchConsultation: typeof fetchConsultation;
  fetchPrescriptionsByPatient: typeof fetchPrescriptionsByPatient;
  listEmissions: typeof listEmissionsByConsultation;
  assemble: typeof assembleEmissionCandidate;
  markSignatureReady: typeof markEmissionSignatureReady;
  authorize: typeof authorizeEmission;
  emit: typeof emitEmission;
  confirmHab: typeof submitHabDecision;
  ensurePrescriptionPdf: (prescriptionId: string) => Promise<void>;
  ensureVisitSummaryPdf: (consultationId: string) => Promise<void>;
  loadSnapshot: typeof loadClinicalCompletionSnapshot;
  saveSnapshot: typeof saveClinicalCompletionSnapshot;
  loadActById?: typeof loadClinicalActById;
  listHabDecisions?: typeof listHabDecisions;
};

export const defaultClinicalCompletionPorts: ClinicalCompletionPorts = {
  fetchConsultation,
  fetchPrescriptionsByPatient,
  listEmissions: listEmissionsByConsultation,
  assemble: assembleEmissionCandidate,
  markSignatureReady: markEmissionSignatureReady,
  authorize: authorizeEmission,
  emit: emitEmission,
  confirmHab: submitHabDecision,
  ensurePrescriptionPdf: downloadPrescriptionPdf,
  ensureVisitSummaryPdf: async (consultationId) => {
    const pdf = await fetchClinicalDocumentPdf(
      "visit_summary",
      consultationId,
      "attachment",
    );
    URL.revokeObjectURL(pdf.objectUrl);
  },
  loadSnapshot: loadClinicalCompletionSnapshot,
  saveSnapshot: saveClinicalCompletionSnapshot,
  loadActById: loadClinicalActById,
  listHabDecisions,
};

function prescriptionsForEncounter(
  rows: PrescriptionRecord[],
  consultationId: string,
): PrescriptionRecord[] {
  return rows.filter((row) => row.consultationId === consultationId);
}

function pickReusableEmission(
  records: EmissionCandidateRecord[],
): EmissionCandidateRecord | null {
  return (
    records.find((record) => isEmitted(record)) ??
    records.find((record) => isInFlight(record)) ??
    null
  );
}

async function resumeOrEmit(input: {
  consultationId: string;
  ports: ClinicalCompletionPorts;
  existing: EmissionCandidateRecord | null;
  sources: EmissionCandidateRecord["sources"];
}): Promise<EmissionCandidateRecord> {
  const { ports, consultationId, sources } = input;
  let candidate = input.existing;

  if (candidate && isEmitted(candidate)) {
    return candidate;
  }

  if (!candidate) {
    candidate = await ports.assemble({
      consultationId,
      emissionClass: "medication",
      sources,
    });
  }

  if (candidate.state === "authorized_pending_pe") {
    return ports.emit(candidate.emissionId);
  }

  if (
    candidate.signatureReadiness === "not_ready" ||
    candidate.state === "assembling"
  ) {
    candidate = await ports.markSignatureReady(candidate.emissionId, true);
  }

  const hab = await ports.confirmHab({
    consultationId,
    kind: "confirm",
    actKind: "prescription_pre_emit",
    rationale: "Physician confirms medication emission after encounter sign",
  });
  candidate = await ports.authorize(candidate.emissionId, hab.decisionId);
  return ports.emit(candidate.emissionId);
}

async function ensureDocument(
  snapshot: ClinicalCompletionSnapshot,
  ports: ClinicalCompletionPorts,
): Promise<ClinicalCompletionSnapshot> {
  if (isImmutableCompletionState(snapshot.state) && snapshot.documentKind) {
    return snapshot;
  }
  if (snapshot.prescriptionId) {
    await ports.ensurePrescriptionPdf(snapshot.prescriptionId);
    return {
      ...snapshot,
      documentKind: "prescription",
      state: "document_ready",
      updatedAt: new Date().toISOString(),
    };
  }
  await ports.ensureVisitSummaryPdf(snapshot.consultationId);
  return {
    ...snapshot,
    documentKind: "visit_summary",
    state: "document_ready",
    updatedAt: new Date().toISOString(),
  };
}

function freezeEncounterMirror(
  snapshot: ClinicalCompletionSnapshot,
  encounterStatus: string,
  ports: ClinicalCompletionPorts,
): ClinicalCompletionSnapshot {
  if (snapshot.encounterStatus === encounterStatus) return snapshot;
  return ports.saveSnapshot({
    ...snapshot,
    encounterStatus,
  });
}

/**
 * Advance Clinical Completion to document_ready without changing Encounter status.
 * Idempotent: existing emission / prescriptionId is reused; emit is not repeated.
 * After document_ready the act is immutable (CC-10, CC-11).
 */
export async function runClinicalCompletion(input: {
  consultationId: string;
  encounterStatus: string;
  patientId?: string | null;
  ports?: Partial<ClinicalCompletionPorts>;
}): Promise<ClinicalCompletionSnapshot> {
  const ports: ClinicalCompletionPorts = {
    ...defaultClinicalCompletionPorts,
    ...input.ports,
  };
  const consultationId = input.consultationId;
  const prior = ports.loadSnapshot(consultationId);

  if (prior && isImmutableCompletionState(prior.state)) {
    return freezeEncounterMirror(prior, input.encounterStatus, ports);
  }

  let snapshot =
    prior ?? createPendingSnapshot(consultationId, input.encounterStatus);
  snapshot = {
    ...snapshot,
    encounterStatus: input.encounterStatus,
  };

  const consultation = await ports.fetchConsultation(consultationId);
  const patientId = input.patientId ?? consultation.patientId ?? null;
  const habs = (await ports.listHabDecisions?.(consultationId)) ?? [];
  const signatureHab =
    [...habs]
      .reverse()
      .find(
        (row) =>
          row.kind === "confirm" && row.actKind === "documentation_finalize",
      ) ?? null;
  const prescriptions = patientId
    ? prescriptionsForEncounter(
        await ports.fetchPrescriptionsByPatient(patientId),
        consultationId,
      )
    : [];
  const existingPrescription =
    (snapshot.prescriptionId
      ? prescriptions.find((row) => row.id === snapshot.prescriptionId)
      : undefined) ?? prescriptions[0];
  const emissions = await ports.listEmissions(consultationId);
  const reusable = pickReusableEmission(emissions);

  if (existingPrescription) {
    snapshot = {
      ...snapshot,
      prescriptionId: existingPrescription.id,
      validationCode: existingPrescription.validationCode ?? null,
      emissionId: reusable?.emissionId ?? snapshot.emissionId,
      emissionHabDecisionId:
        reusable?.habDecisionId ?? snapshot.emissionHabDecisionId,
      state: "emitted",
      updatedAt: new Date().toISOString(),
    };
  } else if (reusable && isEmitted(reusable)) {
    snapshot = {
      ...snapshot,
      emissionId: reusable.emissionId,
      emissionHabDecisionId:
        reusable.habDecisionId ?? snapshot.emissionHabDecisionId,
      state: "emitted",
      updatedAt: new Date().toISOString(),
    };
  } else if (reusable && isInFlight(reusable) && reusable.sources.length > 0) {
    const emitted = await resumeOrEmit({
      consultationId,
      ports,
      existing: reusable,
      sources: reusable.sources,
    });
    snapshot = {
      ...snapshot,
      emissionId: emitted.emissionId,
      emissionHabDecisionId:
        emitted.habDecisionId ?? snapshot.emissionHabDecisionId,
      state: "emitted",
      updatedAt: new Date().toISOString(),
    };
  } else {
    snapshot = {
      ...snapshot,
      state: "no_medication",
      prescriptionId: null,
      updatedAt: new Date().toISOString(),
    };
  }

  snapshot = {
    ...snapshot,
    signedAt: consultation.signedAt ?? snapshot.signedAt,
    signatureHabDecisionId:
      signatureHab?.decisionId ?? snapshot.signatureHabDecisionId,
  };

  snapshot = await ensureDocument(snapshot, ports);
  return ports.saveSnapshot(snapshot);
}

export function getClinicalActAudit(
  clinicalActId: ClinicalActId,
  ports: Pick<ClinicalCompletionPorts, "loadActById"> = defaultClinicalCompletionPorts,
): ClinicalActAuditChain | null {
  const snapshot = ports.loadActById?.(clinicalActId) ?? loadClinicalActById(clinicalActId);
  return snapshot ? reconstructClinicalAct(snapshot) : null;
}

/**
 * CC-11 — a later change does not mutate a frozen act; it opens a new ClinicalActId.
 */
export function supersedeClinicalAct(
  consultationId: string,
  encounterStatus: string,
  ports: Pick<
    ClinicalCompletionPorts,
    "loadSnapshot" | "saveSnapshot"
  > = defaultClinicalCompletionPorts,
): ClinicalCompletionSnapshot | null {
  const current = ports.loadSnapshot(consultationId);
  if (!current || !isImmutableCompletionState(current.state)) return current;
  const next = createPendingSnapshot(consultationId, encounterStatus, {
    supersedes: current.clinicalActId,
  });
  ports.saveSnapshot(
    {
      ...current,
      supersededBy: next.clinicalActId,
      updatedAt: new Date().toISOString(),
    },
    { asCurrent: false },
  );
  return ports.saveSnapshot(next, { asCurrent: true });
}

export async function markClinicalCompletionDelivered(
  consultationId: string,
  ports: Pick<
    ClinicalCompletionPorts,
    "loadSnapshot" | "saveSnapshot"
  > = defaultClinicalCompletionPorts,
): Promise<ClinicalCompletionSnapshot | null> {
  const current = ports.loadSnapshot(consultationId);
  if (!current) return null;
  if (current.state !== "document_ready" && current.state !== "delivered") {
    return current;
  }
  if (current.state === "delivered") return current;
  return ports.saveSnapshot({
    ...current,
    state: "delivered",
    deliveredAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

export function whatsAppHandoffUrl(input: {
  phone?: string | null;
  validationCode?: string | null;
}): string | null {
  const digits = (input.phone ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  const code = input.validationCode
    ? ` Código de validación: ${input.validationCode}.`
    : "";
  const text = encodeURIComponent(
    `Hola, le envío el documento clínico de su consulta HeyDoctor.${code}`,
  );
  return `https://wa.me/${digits}?text=${text}`;
}

export async function loadPatientPhone(
  patientId: string | null | undefined,
): Promise<string | null> {
  if (!patientId) return null;
  try {
    const patient = await fetchPatientById(patientId);
    return patient.phone ?? null;
  } catch {
    return null;
  }
}
