import type {
  EncounterMemoryDecision,
  EncounterMemoryDictationRef,
  EncounterMemoryPatch,
  EncounterMemoryPatientContext,
  EncounterMemoryPendingAction,
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

function samePatientContext(
  a: EncounterMemoryPatientContext,
  b: EncounterMemoryPatientContext,
): boolean {
  return a.name === b.name && a.age === b.age && a.sex === b.sex;
}

function sameStringList(a: string[], b: string[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function samePendingActions(
  a: EncounterMemoryPendingAction[],
  b: EncounterMemoryPendingAction[],
): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i]!.id !== b[i]!.id || a[i]!.status !== b[i]!.status) return false;
  }
  return true;
}

function sameDecisions(
  a: EncounterMemoryDecision[],
  b: EncounterMemoryDecision[],
): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const left = a[i]!;
    const right = b[i]!;
    if (
      left.id !== right.id ||
      left.summary !== right.summary ||
      left.status !== right.status
    ) {
      return false;
    }
  }
  return true;
}

function sameDictationRef(
  a: EncounterMemoryDictationRef | null,
  b: EncounterMemoryDictationRef | null,
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.status === b.status &&
    a.draftLength === b.draftLength &&
    a.active === b.active
  );
}

export function applyEncounterMemoryPatch(
  current: EncounterMemorySnapshot,
  patch: EncounterMemoryPatch,
): EncounterMemorySnapshot {
  const patientContext = patch.patientContext
    ? { ...current.patientContext, ...patch.patientContext }
    : current.patientContext;
  const encounterStatus =
    patch.encounterStatus !== undefined
      ? patch.encounterStatus
      : current.encounterStatus;
  const activeProblems =
    patch.activeProblems !== undefined
      ? patch.activeProblems
      : current.activeProblems;
  const encounterDecisions =
    patch.encounterDecisions !== undefined
      ? patch.encounterDecisions
      : current.encounterDecisions;
  const workflowPhase =
    patch.workflowPhase !== undefined
      ? patch.workflowPhase
      : current.workflowPhase;
  const dictationBufferRef =
    patch.dictationBufferRef !== undefined
      ? patch.dictationBufferRef
      : current.dictationBufferRef;
  const pendingActions =
    patch.pendingActions !== undefined
      ? patch.pendingActions
      : current.pendingActions;

  if (
    encounterStatus === current.encounterStatus &&
    workflowPhase === current.workflowPhase &&
    samePatientContext(patientContext, current.patientContext) &&
    sameStringList(activeProblems, current.activeProblems) &&
    sameDecisions(encounterDecisions, current.encounterDecisions) &&
    sameDictationRef(dictationBufferRef, current.dictationBufferRef) &&
    samePendingActions(pendingActions, current.pendingActions)
  ) {
    return current;
  }

  return {
    ...current,
    encounterStatus,
    patientContext: samePatientContext(patientContext, current.patientContext)
      ? current.patientContext
      : patientContext,
    activeProblems,
    encounterDecisions,
    workflowPhase,
    dictationBufferRef,
    pendingActions,
    updatedAt: new Date().toISOString(),
  };
}
