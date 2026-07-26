import type { CreatePrescriptionDto } from "@/lib/services/prescriptions";
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
