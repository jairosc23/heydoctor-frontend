/**
 * P0 — Minimal Encounter Memory SSOT (in-encounter only).
 * No longitudinal intelligence. No persistence beyond Encounter unmount.
 */

export type EncounterMemoryPatientContext = {
  name: string | null;
  age: string | number | null;
  sex: string | null;
};

export type EncounterMemoryDecision = {
  id: string;
  summary: string;
  status: "pending" | "accepted" | "rejected" | "recorded";
};

export type EncounterMemoryPendingAction = {
  id: string;
  status: string;
};

/** Reference to dictation buffer — not a second transcript store. */
export type EncounterMemoryDictationRef = {
  status: string;
  draftLength: number;
  active: boolean;
};

export type EncounterMemorySnapshot = {
  consultationId: string;
  patientId: string;
  encounterStatus: string | null;
  patientContext: EncounterMemoryPatientContext;
  activeProblems: string[];
  encounterDecisions: EncounterMemoryDecision[];
  workflowPhase: string | null;
  dictationBufferRef: EncounterMemoryDictationRef | null;
  pendingActions: EncounterMemoryPendingAction[];
  updatedAt: string;
};

export type EncounterMemoryPatch = Partial<
  Omit<EncounterMemorySnapshot, "consultationId" | "patientId" | "updatedAt">
>;
