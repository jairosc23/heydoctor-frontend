import {
  createPrescription,
  type CreatePrescriptionDto,
  type PrescriptionRecord,
} from "@/lib/services/prescriptions";
import type { SafetyDecisionPayload } from "@/lib/prescription-safety";
import { postAssistConfirmed } from "./api";
import {
  composerMarkConfirmed,
  composerMarkEmitted,
} from "./create-composition-state";
import type { CompositionState, ProtocolAssistanceProvenance } from "./types";

/**
 * Maps Composer CompositionState → CreatePrescriptionDto.
 * assistanceSession never becomes safetyDecision.
 */
export function toCreatePrescriptionDto(
  state: CompositionState,
): CreatePrescriptionDto {
  if (!state.patientId?.trim()) {
    throw new Error("patient_required");
  }
  const intent = (state.therapeuticIntent ?? "").trim();
  const notesBase = (state.notes ?? "").trim();
  let notes: string | undefined;
  if (intent && notesBase) {
    notes = `${notesBase}\n\nIntent: ${intent}`;
  } else if (intent) {
    notes = `Intent: ${intent}`;
  } else if (notesBase) {
    notes = notesBase;
  }

  return {
    patientId: state.patientId,
    ...(state.consultationId ? { consultationId: state.consultationId } : {}),
    ...(state.diagnosis ? { diagnosis: state.diagnosis } : {}),
    medications: state.medications.map((m) => ({ ...m })),
    ...(notes ? { notes } : {}),
  };
}

export type AssistConfirmedBody = {
  contentHash: string;
  intakeSessionId: string;
  prescriptionId: string;
  physicianEdited: boolean;
  medicationCount: number;
};

/** Build assist-confirmed body for clinical_protocol origin only. */
export function buildAssistConfirmedBody(
  state: CompositionState,
  prescriptionId: string,
): AssistConfirmedBody | null {
  const session = state.assistanceSession;
  if (!session || session.sourceAssetType !== "clinical_protocol") {
    return null;
  }
  const prov = session.assistanceProvenance as ProtocolAssistanceProvenance;
  if (prov.kind !== "protocol_assisted_composition") {
    return null;
  }
  return {
    contentHash: prov.contentHash,
    intakeSessionId: state.intakeSessionId,
    prescriptionId,
    physicianEdited: state.physicianEdited,
    medicationCount: state.medications.length,
  };
}

export type ConfirmAndEmitOptions = {
  /**
   * Confirmation Gate — must be true. Emission without physician confirmation is forbidden.
   */
  physicianConfirmation: true;
  /** Safety Decision is separate from assist provenance (PR-4). */
  safetyDecision?: SafetyDecisionPayload;
};

export type ConfirmAndEmitResult = {
  prescription: PrescriptionRecord;
  state: CompositionState;
  assistConfirmed: { ok: true; persisted: boolean } | null;
};

/** Optional injectors for unit tests — production uses real API clients. */
export type ConfirmAndEmitDeps = {
  createPrescription?: typeof createPrescription;
  postAssistConfirmed?: typeof postAssistConfirmed;
};

/**
 * Sole orchestrator for assisted Composer emit:
 * CONFIRMED → POST /prescriptions → EMITTED → assist-confirmed (best-effort).
 */
export async function confirmAndEmit(
  state: CompositionState,
  options: ConfirmAndEmitOptions,
  deps: ConfirmAndEmitDeps = {},
): Promise<ConfirmAndEmitResult> {
  if (options.physicianConfirmation !== true) {
    throw new Error("confirmation_gate_required");
  }
  if (!state.assistanceSession) {
    throw new Error("assist_session_required");
  }
  if (state.lifecycle !== "HYDRATED" && state.lifecycle !== "EDITED") {
    throw new Error("Confirmation Gate requires HYDRATED or EDITED");
  }
  if (state.medications.length === 0) {
    throw new Error("medications_required");
  }

  const createRx = deps.createPrescription ?? createPrescription;
  const postConfirmed = deps.postAssistConfirmed ?? postAssistConfirmed;

  const confirmed = composerMarkConfirmed(state);
  const dto = toCreatePrescriptionDto(confirmed);
  if (options.safetyDecision) {
    dto.safetyDecision = options.safetyDecision;
  }

  const prescription = await createRx(dto);
  const emitted = composerMarkEmitted(confirmed);

  let assistConfirmed: { ok: true; persisted: boolean } | null = null;
  const body = buildAssistConfirmedBody(emitted, prescription.id);
  if (body) {
    const prov = emitted.assistanceSession!
      .assistanceProvenance as ProtocolAssistanceProvenance;
    try {
      assistConfirmed = await postConfirmed(
        prov.protocolId,
        prov.protocolVersionId,
        body,
      );
    } catch {
      // Best-effort: never roll back clinical emit
      assistConfirmed = { ok: true, persisted: false };
    }
  }

  return { prescription, state: emitted, assistConfirmed };
}
