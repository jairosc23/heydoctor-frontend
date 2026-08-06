import type {
  EncounterMemoryPatch,
  EncounterMemorySnapshot,
} from "./types";

export function createEmptyEncounterMemory(input: {
  consultationId: string;
  patientId: string;
}): EncounterMemorySnapshot {
  return {
    consultationId: input.consultationId,
    patientId: input.patientId,
    encounterStatus: null,
    patientContext: { name: null, age: null, sex: null },
    activeProblems: [],
    encounterDecisions: [],
    workflowPhase: null,
    dictationBufferRef: null,
    pendingActions: [],
    updatedAt: new Date().toISOString(),
  };
}

export function applyEncounterMemoryPatch(
  current: EncounterMemorySnapshot,
  patch: EncounterMemoryPatch,
): EncounterMemorySnapshot {
  return {
    ...current,
    ...patch,
    patientContext: patch.patientContext
      ? { ...current.patientContext, ...patch.patientContext }
      : current.patientContext,
    updatedAt: new Date().toISOString(),
  };
}
