/**
 * CP-28 — VoiceSession factory helpers.
 */

import type { VoiceEngineKind } from "../types";
import type {
  VoicePermissionStatus,
  VoiceSession,
  VoiceSessionPhase,
} from "./types";

export function createVoiceSessionId(): string {
  return `vses_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createVoiceSession(input: {
  sessionId?: string;
  engine: VoiceEngineKind;
  permissionStatus?: VoicePermissionStatus;
  createdAt: string;
  timeoutMs?: number | null;
}): VoiceSession {
  return {
    sessionId: input.sessionId ?? createVoiceSessionId(),
    engine: input.engine,
    phase: "created",
    permissionStatus: input.permissionStatus ?? "unknown",
    createdAt: input.createdAt,
    startedAt: null,
    pausedAt: null,
    endedAt: null,
    pauseCount: 0,
    lastError: null,
    interimTranscript: null,
    finalTranscript: null,
    timeoutMs: input.timeoutMs ?? null,
  };
}

export function isTerminalVoiceSessionPhase(
  phase: VoiceSessionPhase,
): boolean {
  return (
    phase === "completed" ||
    phase === "cancelled" ||
    phase === "timed_out" ||
    phase === "idle"
  );
}

export function isActiveVoiceSessionPhase(phase: VoiceSessionPhase): boolean {
  return (
    phase === "starting" ||
    phase === "listening" ||
    phase === "paused" ||
    phase === "resuming" ||
    phase === "processing" ||
    phase === "recovering"
  );
}
