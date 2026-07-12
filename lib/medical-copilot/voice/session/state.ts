/**
 * CP-28 — Pure VoiceSessionManager state transitions.
 */

import {
  INITIAL_VOICE_SESSION_MANAGER_STATE,
  type VoiceSession,
  type VoiceSessionEvent,
  type VoiceSessionManagerState,
  type VoiceSessionPhase,
} from "./types";
import { isActiveVoiceSessionPhase } from "./session";

export function createVoiceSessionManagerState(
  overrides?: Partial<VoiceSessionManagerState>,
): VoiceSessionManagerState {
  return {
    ...INITIAL_VOICE_SESSION_MANAGER_STATE,
    ...overrides,
  };
}

function patchSession(
  session: VoiceSession | null,
  patch: Partial<VoiceSession>,
): VoiceSession | null {
  if (!session) return null;
  return { ...session, ...patch };
}

function withMeta(
  state: VoiceSessionManagerState,
  event: VoiceSessionEvent,
  patch: Partial<VoiceSessionManagerState>,
): VoiceSessionManagerState {
  const phase = patch.phase ?? state.phase;
  return {
    ...state,
    ...patch,
    phase,
    active: isActiveVoiceSessionPhase(phase),
    lastEventAt: event.occurredAt,
    engine: patch.engine ?? event.engine ?? state.engine,
  };
}

export function applyVoiceSessionEvent(
  state: VoiceSessionManagerState,
  event: VoiceSessionEvent,
): VoiceSessionManagerState {
  switch (event.type) {
    case "session_created":
      return withMeta(state, event, {
        session: event.payload.session,
        phase: "created",
        engine: event.payload.session.engine,
        permissionStatus: event.payload.session.permissionStatus,
        timeoutMs: event.payload.session.timeoutMs,
      });

    case "session_starting":
      return withMeta(state, event, {
        phase: "starting",
        session: patchSession(state.session, {
          phase: "starting",
          lastError: null,
        }),
      });

    case "session_started":
      return withMeta(state, event, {
        phase: "listening",
        session: patchSession(state.session, {
          phase: "listening",
          startedAt: state.session?.startedAt ?? event.occurredAt,
          pausedAt: null,
        }),
      });

    case "session_paused":
      return withMeta(state, event, {
        phase: "paused",
        session: patchSession(state.session, {
          phase: "paused",
          pausedAt: event.occurredAt,
          pauseCount: event.payload.pauseCount,
        }),
      });

    case "session_resuming":
      return withMeta(state, event, {
        phase: "resuming",
        session: patchSession(state.session, { phase: "resuming" }),
      });

    case "session_resumed":
      return withMeta(state, event, {
        phase: "listening",
        session: patchSession(state.session, {
          phase: "listening",
          pausedAt: null,
        }),
      });

    case "session_processing":
      return withMeta(state, event, {
        phase: "processing",
        session: patchSession(state.session, { phase: "processing" }),
      });

    case "session_completed":
      return withMeta(state, event, {
        phase: "completed",
        session: patchSession(state.session, {
          phase: "completed",
          endedAt: event.occurredAt,
          finalTranscript: event.payload.transcript,
          interimTranscript: null,
        }),
      });

    case "session_cancelled":
      return withMeta(state, event, {
        phase: "cancelled",
        session: patchSession(state.session, {
          phase: "cancelled",
          endedAt: event.occurredAt,
          interimTranscript: null,
        }),
      });

    case "session_timed_out":
      return withMeta(state, event, {
        phase: "timed_out",
        session: patchSession(state.session, {
          phase: "timed_out",
          endedAt: event.occurredAt,
          lastError: `timed_out_after_${event.payload.timeoutMs}ms`,
        }),
      });

    case "session_error":
      return withMeta(state, event, {
        phase: "error",
        session: patchSession(state.session, {
          phase: "error",
          lastError: event.payload.error,
        }) ?? state.session,
      });

    case "session_recovering":
      return withMeta(state, event, {
        phase: "recovering",
        session: patchSession(state.session, {
          phase: "recovering",
        }),
      });

    case "session_recovered":
      return withMeta(state, event, {
        phase: "created",
        session: patchSession(state.session, {
          phase: "created",
          lastError: null,
          endedAt: null,
          startedAt: null,
          pausedAt: null,
          interimTranscript: null,
          finalTranscript: null,
        }),
      });

    case "engine_changed":
      return withMeta(state, event, {
        engine: event.payload.engine,
        session: patchSession(state.session, {
          engine: event.payload.engine,
        }),
      });

    case "permission_status_changed":
      return withMeta(state, event, {
        permissionStatus: event.payload.permissionStatus,
        session: patchSession(state.session, {
          permissionStatus: event.payload.permissionStatus,
        }),
      });

    case "interim_transcript":
      return withMeta(state, event, {
        session: patchSession(state.session, {
          interimTranscript: event.payload.text,
        }),
      });

    case "final_transcript":
      return withMeta(state, event, {
        session: patchSession(state.session, {
          finalTranscript: event.payload.text,
          interimTranscript: null,
        }),
      });

    default: {
      const _exhaustive: never = event;
      void _exhaustive;
      return state;
    }
  }
}

export function canCreateVoiceSession(phase: VoiceSessionPhase): boolean {
  return (
    phase === "idle" ||
    phase === "completed" ||
    phase === "cancelled" ||
    phase === "timed_out" ||
    phase === "error"
  );
}

export function canStartVoiceSessionManager(
  phase: VoiceSessionPhase,
): boolean {
  return phase === "created";
}

export function canPauseVoiceSession(phase: VoiceSessionPhase): boolean {
  return phase === "listening";
}

export function canResumeVoiceSession(phase: VoiceSessionPhase): boolean {
  return phase === "paused";
}

export function canCompleteVoiceSession(phase: VoiceSessionPhase): boolean {
  return phase === "listening" || phase === "paused";
}

export function canCancelVoiceSessionManager(
  phase: VoiceSessionPhase,
): boolean {
  return (
    phase === "created" ||
    phase === "starting" ||
    phase === "listening" ||
    phase === "paused" ||
    phase === "resuming" ||
    phase === "processing" ||
    phase === "recovering"
  );
}

export function canRecoverVoiceSession(phase: VoiceSessionPhase): boolean {
  return phase === "error" || phase === "timed_out";
}
