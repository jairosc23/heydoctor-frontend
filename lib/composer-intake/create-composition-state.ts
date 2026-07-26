import { assertIntakeDraft } from "./intake-gate";
import type {
  ClinicalAssistPrefillDraft,
  CompositionState,
  IntakeContext,
  IntakeSession,
} from "./types";
import { emptyAssistanceContext } from "./types";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `intake-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Composition State Ownership: only Composer creates state from a draft.
 * Adapters must not call this with an existing hydrated state to "patch" it.
 */
export function buildIntakeSession(
  draft: ClinicalAssistPrefillDraft,
): IntakeSession {
  const normalized = assertIntakeDraft(draft);
  const receivedAt = new Date().toISOString();
  const intakeSessionId = newId();
  const assistanceContext =
    normalized.assistanceContext ?? emptyAssistanceContext();

  return {
    intakeSessionId,
    receivedAt,
    sourceAssetType: normalized.sourceAssetType,
    sourceAssetId: normalized.sourceAssetId,
    sourceRevisionId: normalized.sourceRevisionId,
    hydratedClinical: {
      cie10CodeId: normalized.cie10CodeId ?? null,
      diagnosis: normalized.diagnosis ?? null,
      medications: normalized.medications.map((m) => ({ ...m })),
      notes: normalized.notes ?? null,
      therapeuticIntent: normalized.therapeuticIntent ?? null,
      tags: [...(normalized.tags ?? [])],
    },
    assistanceSession: {
      sourceAssetType: normalized.sourceAssetType,
      sourceAssetId: normalized.sourceAssetId,
      sourceRevisionId: normalized.sourceRevisionId,
      assistanceProvenance: normalized.assistanceProvenance,
      assistanceContext: { ...assistanceContext, evaluated: false },
      receivedAt,
    },
  };
}

export function createCompositionStateFromIntake(
  intake: IntakeSession,
  ctx: IntakeContext,
): CompositionState {
  const now = new Date().toISOString();
  return {
    lifecycle: "HYDRATED",
    patientId: ctx.patientId,
    consultationId: ctx.consultationId ?? null,
    cie10CodeId: intake.hydratedClinical.cie10CodeId ?? null,
    diagnosis: intake.hydratedClinical.diagnosis ?? null,
    medications: intake.hydratedClinical.medications.map((m) => ({ ...m })),
    notes: intake.hydratedClinical.notes ?? null,
    therapeuticIntent: intake.hydratedClinical.therapeuticIntent ?? null,
    tags: [...(intake.hydratedClinical.tags ?? [])],
    assistanceSession: { ...intake.assistanceSession },
    intakeSessionId: intake.intakeSessionId,
    physicianEdited: false,
    updatedAt: now,
  };
}

/** Composer-owned clinical edits — flips physicianEdited (T6 SoT). */
export function composerEditClinical(
  state: CompositionState,
  patch: Partial<
    Pick<
      CompositionState,
      | "cie10CodeId"
      | "diagnosis"
      | "medications"
      | "notes"
      | "therapeuticIntent"
      | "tags"
      | "consultationId"
    >
  >,
): CompositionState {
  if (state.lifecycle === "EMPTY" || state.lifecycle === "EMITTED") {
    throw new Error("Cannot edit clinical fields in lifecycle " + state.lifecycle);
  }
  return {
    ...state,
    ...patch,
    medications: patch.medications
      ? patch.medications.map((m) => ({ ...m }))
      : state.medications,
    lifecycle: state.lifecycle === "HYDRATED" ? "EDITED" : state.lifecycle,
    physicianEdited: true,
    updatedAt: new Date().toISOString(),
  };
}

/** Composer State Transition — Confirmation Gate (no emit yet). */
export function composerMarkConfirmed(state: CompositionState): CompositionState {
  if (state.lifecycle !== "HYDRATED" && state.lifecycle !== "EDITED") {
    throw new Error("Confirmation Gate requires HYDRATED or EDITED");
  }
  if (!state.patientId?.trim()) {
    throw new Error("patient_required");
  }
  return {
    ...state,
    lifecycle: "CONFIRMED",
    updatedAt: new Date().toISOString(),
  };
}

export function composerMarkEmitted(state: CompositionState): CompositionState {
  if (state.lifecycle !== "CONFIRMED") {
    throw new Error("EMITTED requires CONFIRMED");
  }
  return {
    ...state,
    lifecycle: "EMITTED",
    updatedAt: new Date().toISOString(),
  };
}

export function emptyCompositionState(patientId = ""): CompositionState {
  return {
    lifecycle: "EMPTY",
    patientId,
    medications: [],
    intakeSessionId: "",
    physicianEdited: false,
    updatedAt: new Date().toISOString(),
  };
}
