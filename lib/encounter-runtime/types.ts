/**
 * GCE-W2 — Clinical Encounter Runtime v1 public types.
 * COS Blueprint L3 — orchestration only; no clinical write ownership.
 */

export type EncounterRuntimeState =
  | "idle"
  | "opening"
  | "ready"
  | "assisting"
  | "closing"
  | "closed"
  | "failed";

export type EncounterRuntimeActor = {
  doctorId: string;
  clinicId: string;
  patientId: string;
  encounterId: string;
};

export type EncounterRuntimeError = {
  code: string;
  message: string;
};

export type EncounterRuntimeSession = {
  sessionId: string;
  state: EncounterRuntimeState;
  actor: EncounterRuntimeActor;
  activePluginIds: string[];
  lastError: EncounterRuntimeError | null;
  openedAt: string | null;
  closedAt: string | null;
};
