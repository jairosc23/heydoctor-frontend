/**
 * CP-31 — Clinical Voice Dictation types.
 * In-memory only — never writes SOAP / EMR / Workspace artifacts.
 */

export type DictationStatus =
  | "idle"
  | "starting"
  | "listening"
  | "paused"
  | "finalizing"
  | "completed"
  | "cancelled"
  | "error";

export type DictationSession = {
  sessionId: string;
  status: DictationStatus;
  consultationId: string | null;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  error: string | null;
  providerId: string | null;
};

/**
 * Editable in-memory transcript buffer.
 * `draft` is what the clinician sees/edits; partial/finals feed into it.
 */
export type DictationBuffer = {
  /** Editable clinician-facing text. */
  draft: string;
  /** Latest interim (partial) hypothesis — not persisted. */
  partial: string | null;
  /** Concatenated finals received this session (source of truth before edits). */
  committed: string;
  updatedAt: string | null;
};

export type ClinicalDictationState = {
  session: DictationSession | null;
  buffer: DictationBuffer;
  status: DictationStatus;
  active: boolean;
};

export const EMPTY_DICTATION_BUFFER: DictationBuffer = {
  draft: "",
  partial: null,
  committed: "",
  updatedAt: null,
};

export const INITIAL_CLINICAL_DICTATION_STATE: ClinicalDictationState = {
  session: null,
  buffer: EMPTY_DICTATION_BUFFER,
  status: "idle",
  active: false,
};
