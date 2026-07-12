/**
 * CP-27 — Public contracts for Voice Copilot Foundation.
 * Decoupled from MedicalCopilotStore, Workspace, and real speech APIs.
 */

import type {
  VoiceCopilotEvent,
  VoiceCopilotState,
  VoiceEngineKind,
} from "./types";

export type VoiceCopilotEventListener = (event: VoiceCopilotEvent) => void;
export type VoiceCopilotStateListener = (state: VoiceCopilotState) => void;

/**
 * Transport/engine provider.
 * Real engines (Web Speech, Deepgram, …) plug in here in CP-28+.
 * Foundation ships only the mock provider — no mic / STT / TTS.
 */
export interface VoiceTransportProvider {
  readonly kind: VoiceEngineKind;
  /** Always false in CP-27; real audio arrives in Speech Integration. */
  readonly capturesAudio: boolean;
  start(input: { voiceSessionId: string }): Promise<void>;
  /**
   * Stop listening and optionally produce a final transcript signal
   * via provider events (mock emits synthetic transcript).
   */
  stop(): Promise<void>;
  cancel(reason?: string | null): Promise<void>;
  onEvent(listener: VoiceCopilotEventListener): () => void;
}

export interface VoiceCopilotService {
  getState(): VoiceCopilotState;
  subscribe(listener: VoiceCopilotStateListener): () => void;
  onEvent(listener: VoiceCopilotEventListener): () => void;
  /** Begin a voice session (idle|completed|cancelled|error → starting → listening). */
  start(): Promise<void>;
  /** Stop listening → processing → completed (mock path). */
  stop(): Promise<void>;
  /** Abort active session → cancelled. */
  cancel(reason?: string | null): Promise<void>;
  /** Return to idle and clear transcripts. */
  reset(): void;
  /**
   * Select logical engine kind for future Speech Integration.
   * Until a real provider is registered, runtime stays on mock.
   */
  setEngine(engine: VoiceEngineKind): void;
  getEngine(): VoiceEngineKind;
}
