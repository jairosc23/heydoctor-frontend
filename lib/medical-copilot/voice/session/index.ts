/**
 * CP-28 — Voice Session Manager Foundation (public barrel).
 */

export type {
  CreateVoiceSessionInput,
  VoiceSessionClock,
  VoiceSessionEventListener,
  VoiceSessionManager,
  VoiceSessionStateListener,
  VoiceSessionTimerHandle,
} from "./contracts";

export type {
  VoicePermissionStatus,
  VoiceSession,
  VoiceSessionEvent,
  VoiceSessionEventBase,
  VoiceSessionEventType,
  VoiceSessionManagerState,
  VoiceSessionPhase,
} from "./types";

export { INITIAL_VOICE_SESSION_MANAGER_STATE } from "./types";

export {
  createVoiceSession,
  createVoiceSessionId,
  isActiveVoiceSessionPhase,
  isTerminalVoiceSessionPhase,
} from "./session";

export {
  applyVoiceSessionEvent,
  canCancelVoiceSessionManager,
  canCompleteVoiceSession,
  canCreateVoiceSession,
  canPauseVoiceSession,
  canRecoverVoiceSession,
  canResumeVoiceSession,
  canStartVoiceSessionManager,
  createVoiceSessionManagerState,
} from "./state";

export { createVoiceSessionManager } from "./manager";
