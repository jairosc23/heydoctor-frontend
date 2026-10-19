/**
 * CP-31 — Clinical Dictation public barrel.
 */

export type {
  ClinicalDictationState,
  DictationBuffer,
  DictationSession,
  DictationStatus,
} from "./types";

export {
  EMPTY_DICTATION_BUFFER,
  INITIAL_CLINICAL_DICTATION_STATE,
} from "./types";

export {
  applyFinalTranscript,
  applyPartialTranscript,
  clearDictationBuffer,
  createEmptyDictationBuffer,
  joinCommittedAndPartial,
  setDictationDraft,
} from "./buffer";

export {
  createClinicalDictationService,
  type ClinicalDictationService,
  type ClinicalDictationStateListener,
  type CreateClinicalDictationServiceOptions,
} from "./service";
