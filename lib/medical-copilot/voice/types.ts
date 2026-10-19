/**
 * CP-27 — Voice Copilot Foundation types.
 * Lifecycle only — no real audio, STT, or TTS.
 */

export type VoiceCopilotPhase =
  | "idle"
  | "starting"
  | "listening"
  | "processing"
  | "completed"
  | "cancelled"
  | "error";

/** Extension points for future speech engines (CP-28+). */
export type VoiceEngineKind =
  | "mock"
  | "web_speech"
  | "deepgram"
  | "openai_realtime"
  | "azure_speech"
  | "google_speech";

export type VoiceCopilotState = {
  phase: VoiceCopilotPhase;
  engine: VoiceEngineKind;
  /** Logical voice session id (not Medical Copilot session). */
  voiceSessionId: string | null;
  interimTranscript: string | null;
  finalTranscript: string | null;
  error: string | null;
  lastEventAt: string | null;
  /** True while phase is starting | listening | processing. */
  active: boolean;
};

export type VoiceCopilotEventType =
  | "session_starting"
  | "listening_started"
  | "interim_transcript"
  | "final_transcript"
  | "processing_started"
  | "session_completed"
  | "session_cancelled"
  | "session_error"
  | "engine_changed";

export type VoiceCopilotEventBase = {
  type: VoiceCopilotEventType;
  occurredAt: string;
  voiceSessionId: string | null;
  engine: VoiceEngineKind;
};

export type VoiceCopilotEvent =
  | (VoiceCopilotEventBase & {
      type: "session_starting";
      payload: { voiceSessionId: string };
    })
  | (VoiceCopilotEventBase & {
      type: "listening_started";
      payload: Record<string, never>;
    })
  | (VoiceCopilotEventBase & {
      type: "interim_transcript";
      payload: { text: string };
    })
  | (VoiceCopilotEventBase & {
      type: "final_transcript";
      payload: { text: string };
    })
  | (VoiceCopilotEventBase & {
      type: "processing_started";
      payload: Record<string, never>;
    })
  | (VoiceCopilotEventBase & {
      type: "session_completed";
      payload: { transcript: string | null };
    })
  | (VoiceCopilotEventBase & {
      type: "session_cancelled";
      payload: { reason: string | null };
    })
  | (VoiceCopilotEventBase & {
      type: "session_error";
      payload: { error: string };
    })
  | (VoiceCopilotEventBase & {
      type: "engine_changed";
      payload: { engine: VoiceEngineKind };
    });

export const INITIAL_VOICE_COPILOT_STATE: VoiceCopilotState = {
  phase: "idle",
  engine: "mock",
  voiceSessionId: null,
  interimTranscript: null,
  finalTranscript: null,
  error: null,
  lastEventAt: null,
  active: false,
};

export const VOICE_ENGINE_KINDS: readonly VoiceEngineKind[] = [
  "mock",
  "web_speech",
  "deepgram",
  "openai_realtime",
  "azure_speech",
  "google_speech",
] as const;
