/**
 * CP-28 — Voice Session Manager types.
 * Session lifecycle only — no real audio, STT, TTS, or permission prompts.
 */

import type { VoiceEngineKind } from "../types";

export type VoiceSessionPhase =
  | "idle"
  | "created"
  | "starting"
  | "listening"
  | "paused"
  | "resuming"
  | "processing"
  | "completed"
  | "cancelled"
  | "timed_out"
  | "error"
  | "recovering";

/** Logical mic permission — never requests browser permissions in CP-28. */
export type VoicePermissionStatus =
  | "unknown"
  | "prompt"
  | "granted"
  | "denied";

export type VoiceSession = {
  sessionId: string;
  engine: VoiceEngineKind;
  phase: VoiceSessionPhase;
  permissionStatus: VoicePermissionStatus;
  createdAt: string;
  startedAt: string | null;
  pausedAt: string | null;
  endedAt: string | null;
  pauseCount: number;
  lastError: string | null;
  interimTranscript: string | null;
  finalTranscript: string | null;
  timeoutMs: number | null;
};

export type VoiceSessionManagerState = {
  session: VoiceSession | null;
  phase: VoiceSessionPhase;
  engine: VoiceEngineKind;
  permissionStatus: VoicePermissionStatus;
  /** Soft timeout while listening; null disables. */
  timeoutMs: number | null;
  active: boolean;
  lastEventAt: string | null;
};

export type VoiceSessionEventType =
  | "session_created"
  | "session_starting"
  | "session_started"
  | "session_paused"
  | "session_resuming"
  | "session_resumed"
  | "session_processing"
  | "session_completed"
  | "session_cancelled"
  | "session_timed_out"
  | "session_error"
  | "session_recovering"
  | "session_recovered"
  | "engine_changed"
  | "permission_status_changed"
  | "interim_transcript"
  | "final_transcript";

export type VoiceSessionEventBase = {
  type: VoiceSessionEventType;
  occurredAt: string;
  sessionId: string | null;
  engine: VoiceEngineKind;
};

export type VoiceSessionEvent =
  | (VoiceSessionEventBase & {
      type: "session_created";
      payload: { session: VoiceSession };
    })
  | (VoiceSessionEventBase & {
      type: "session_starting";
      payload: { sessionId: string };
    })
  | (VoiceSessionEventBase & {
      type: "session_started";
      payload: { sessionId: string };
    })
  | (VoiceSessionEventBase & {
      type: "session_paused";
      payload: { sessionId: string; pauseCount: number };
    })
  | (VoiceSessionEventBase & {
      type: "session_resuming";
      payload: { sessionId: string };
    })
  | (VoiceSessionEventBase & {
      type: "session_resumed";
      payload: { sessionId: string };
    })
  | (VoiceSessionEventBase & {
      type: "session_processing";
      payload: { sessionId: string };
    })
  | (VoiceSessionEventBase & {
      type: "session_completed";
      payload: { sessionId: string; transcript: string | null };
    })
  | (VoiceSessionEventBase & {
      type: "session_cancelled";
      payload: { sessionId: string; reason: string | null };
    })
  | (VoiceSessionEventBase & {
      type: "session_timed_out";
      payload: { sessionId: string; timeoutMs: number };
    })
  | (VoiceSessionEventBase & {
      type: "session_error";
      payload: { sessionId: string | null; error: string };
    })
  | (VoiceSessionEventBase & {
      type: "session_recovering";
      payload: { sessionId: string; fromError: string };
    })
  | (VoiceSessionEventBase & {
      type: "session_recovered";
      payload: { sessionId: string };
    })
  | (VoiceSessionEventBase & {
      type: "engine_changed";
      payload: { engine: VoiceEngineKind };
    })
  | (VoiceSessionEventBase & {
      type: "permission_status_changed";
      payload: { permissionStatus: VoicePermissionStatus };
    })
  | (VoiceSessionEventBase & {
      type: "interim_transcript";
      payload: { text: string };
    })
  | (VoiceSessionEventBase & {
      type: "final_transcript";
      payload: { text: string };
    });

export const INITIAL_VOICE_SESSION_MANAGER_STATE: VoiceSessionManagerState = {
  session: null,
  phase: "idle",
  engine: "mock",
  permissionStatus: "unknown",
  timeoutMs: null,
  active: false,
  lastEventAt: null,
};
