/**
 * CP-28 — Public contracts for Voice Session Manager.
 */

import type { VoiceTransportProvider } from "../contracts";
import type { VoiceEngineKind } from "../types";
import type {
  VoicePermissionStatus,
  VoiceSession,
  VoiceSessionEvent,
  VoiceSessionManagerState,
} from "./types";

export type VoiceSessionEventListener = (event: VoiceSessionEvent) => void;
export type VoiceSessionStateListener = (
  state: VoiceSessionManagerState,
) => void;

export type VoiceSessionTimerHandle = { readonly id: number };

export type VoiceSessionClock = {
  now(): string;
  setTimeout(fn: () => void, ms: number): VoiceSessionTimerHandle;
  clearTimeout(handle: VoiceSessionTimerHandle): void;
};

export type CreateVoiceSessionInput = {
  engine?: VoiceEngineKind;
  timeoutMs?: number | null;
};

export interface VoiceSessionManager {
  getState(): VoiceSessionManagerState;
  getSession(): VoiceSession | null;
  subscribe(listener: VoiceSessionStateListener): () => void;
  onEvent(listener: VoiceSessionEventListener): () => void;

  /** Create a session in `created` without starting transport. */
  createSession(input?: CreateVoiceSessionInput): VoiceSession | null;
  start(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  /** Finish listening → processing → completed. */
  complete(): Promise<void>;
  cancel(reason?: string | null): Promise<void>;
  /** Recover from `error` / `timed_out` back to `created` (or listening if recoverable). */
  recover(): Promise<void>;

  setEngine(engine: VoiceEngineKind): void;
  /**
   * Logical permission status only — never prompts the browser.
   */
  setPermissionStatus(status: VoicePermissionStatus): void;
  setTimeoutMs(timeoutMs: number | null): void;

  /** Optional transport (mock today). */
  getTransport(): VoiceTransportProvider | null;
}
