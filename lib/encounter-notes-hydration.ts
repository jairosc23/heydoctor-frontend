import type { ClinicalVitalSigns } from "./clinical-vital-signs-context";
import type { EncounterNotesDraft } from "./encounter-notes-types";
import type { PhysicalExam } from "./physical-exam-framework";

/**
 * Snapshot of the Encounter editor fields owned by useEncounterNotesDraft.
 * Autosave may rewrite consultation.notes; this snapshot decides whether that
 * echo may replace the in-progress caret/value.
 */
export type EncounterNotesEditorSnapshot = {
  presentIllnessHistory: string;
  vitals: ClinicalVitalSigns;
  physicalExam: PhysicalExam;
};

export type EncounterNotesHydrationDecision =
  | "hydrate"
  | "adopt-echo"
  | "keep-local";

export function encounterNotesEditorSnapshotFromParsed(
  parsed: EncounterNotesDraft,
): EncounterNotesEditorSnapshot {
  return {
    presentIllnessHistory: parsed.clinicalRecord.presentIllnessHistory,
    vitals: parsed.vitals,
    physicalExam: parsed.physicalExam,
  };
}

export function encounterNotesEditorSnapshotKey(
  snapshot: EncounterNotesEditorSnapshot,
): string {
  return JSON.stringify({
    presentIllnessHistory: snapshot.presentIllnessHistory,
    vitals: snapshot.vitals,
    physicalExam: snapshot.physicalExam,
  });
}

/**
 * Hydrate from server notes on encounter identity changes and first load.
 * Never replace an in-progress local draft with a stale or reformatted echo.
 */
export function resolveEncounterNotesHydration(input: {
  consultationId: string;
  previousConsultationId: string | null;
  incomingRawNotes: string;
  lastHydratedRawNotes: string | null;
  local: EncounterNotesEditorSnapshot;
  lastHydratedLocal: EncounterNotesEditorSnapshot | null;
  incoming: EncounterNotesEditorSnapshot;
}): EncounterNotesHydrationDecision {
  const localKey = encounterNotesEditorSnapshotKey(input.local);
  const incomingKey = encounterNotesEditorSnapshotKey(input.incoming);
  const lastLocalKey = input.lastHydratedLocal
    ? encounterNotesEditorSnapshotKey(input.lastHydratedLocal)
    : null;
  const dirty = lastLocalKey != null && localKey !== lastLocalKey;

  if (input.previousConsultationId === null) {
    return "hydrate";
  }

  if (input.previousConsultationId !== input.consultationId) {
    const initialFetch =
      input.previousConsultationId === "" && input.consultationId !== "";
    if (initialFetch && dirty) {
      return localKey === incomingKey ? "adopt-echo" : "keep-local";
    }
    return "hydrate";
  }

  if (input.lastHydratedRawNotes === input.incomingRawNotes) {
    return "keep-local";
  }

  if (localKey === incomingKey) {
    return "adopt-echo";
  }

  if (dirty) {
    return "keep-local";
  }

  return "hydrate";
}
