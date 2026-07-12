/**
 * CP-27 — Pure VoiceCopilot state transitions from events.
 */

import {
  INITIAL_VOICE_COPILOT_STATE,
  type VoiceCopilotEvent,
  type VoiceCopilotState,
  type VoiceEngineKind,
} from "./types";

export function createVoiceCopilotState(
  overrides?: Partial<VoiceCopilotState>,
): VoiceCopilotState {
  return {
    ...INITIAL_VOICE_COPILOT_STATE,
    ...overrides,
  };
}

function withMeta(
  state: VoiceCopilotState,
  event: VoiceCopilotEvent,
  patch: Partial<VoiceCopilotState>,
): VoiceCopilotState {
  const phase = patch.phase ?? state.phase;
  const active =
    phase === "starting" || phase === "listening" || phase === "processing";
  return {
    ...state,
    ...patch,
    phase,
    active,
    lastEventAt: event.occurredAt,
    engine: event.engine ?? state.engine,
    voiceSessionId:
      patch.voiceSessionId !== undefined
        ? patch.voiceSessionId
        : event.voiceSessionId !== undefined
          ? event.voiceSessionId
          : state.voiceSessionId,
  };
}

export function applyVoiceCopilotEvent(
  state: VoiceCopilotState,
  event: VoiceCopilotEvent,
): VoiceCopilotState {
  switch (event.type) {
    case "session_starting":
      return withMeta(state, event, {
        phase: "starting",
        voiceSessionId: event.payload.voiceSessionId,
        interimTranscript: null,
        finalTranscript: null,
        error: null,
      });
    case "listening_started":
      return withMeta(state, event, { phase: "listening", error: null });
    case "interim_transcript":
      return withMeta(state, event, {
        interimTranscript: event.payload.text,
      });
    case "final_transcript":
      return withMeta(state, event, {
        finalTranscript: event.payload.text,
        interimTranscript: null,
      });
    case "processing_started":
      return withMeta(state, event, { phase: "processing" });
    case "session_completed":
      return withMeta(state, event, {
        phase: "completed",
        finalTranscript:
          event.payload.transcript ?? state.finalTranscript,
        interimTranscript: null,
        error: null,
      });
    case "session_cancelled":
      return withMeta(state, event, {
        phase: "cancelled",
        interimTranscript: null,
        error: null,
      });
    case "session_error":
      return withMeta(state, event, {
        phase: "error",
        error: event.payload.error,
      });
    case "engine_changed":
      return withMeta(state, event, {
        engine: event.payload.engine,
      });
    default: {
      const _exhaustive: never = event;
      void _exhaustive;
      return state;
    }
  }
}

export function canStartVoiceSession(phase: VoiceCopilotState["phase"]): boolean {
  return (
    phase === "idle" ||
    phase === "completed" ||
    phase === "cancelled" ||
    phase === "error"
  );
}

export function canStopVoiceSession(phase: VoiceCopilotState["phase"]): boolean {
  return phase === "listening" || phase === "starting";
}

export function canCancelVoiceSession(
  phase: VoiceCopilotState["phase"],
): boolean {
  return (
    phase === "starting" ||
    phase === "listening" ||
    phase === "processing"
  );
}

export function isVoiceEngineKind(value: string): value is VoiceEngineKind {
  return (
    value === "mock" ||
    value === "web_speech" ||
    value === "deepgram" ||
    value === "openai_realtime" ||
    value === "azure_speech" ||
    value === "google_speech"
  );
}
