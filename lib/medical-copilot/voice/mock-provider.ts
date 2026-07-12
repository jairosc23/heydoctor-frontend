/**
 * CP-27 — Mock VoiceTransportProvider.
 * Simulates lifecycle events without microphone or STT APIs.
 */

import type { VoiceTransportProvider, VoiceCopilotEventListener } from "./contracts";
import type { VoiceCopilotEvent } from "./types";

export type CreateMockVoiceTransportProviderOptions = {
  /** Synthetic final transcript emitted on stop(). */
  mockTranscript?: string;
  /** Emit an interim transcript while listening (default true). */
  emitInterim?: boolean;
};

function nowIso(): string {
  return new Date().toISOString();
}

export function createMockVoiceTransportProvider(
  options: CreateMockVoiceTransportProviderOptions = {},
): VoiceTransportProvider {
  const mockTranscript =
    options.mockTranscript ??
    "Mock voice transcript — no real speech recognition";
  const emitInterim = options.emitInterim !== false;

  const listeners = new Set<VoiceCopilotEventListener>();
  let voiceSessionId: string | null = null;
  let active = false;

  function emit(
    event: Omit<VoiceCopilotEvent, "occurredAt" | "engine" | "voiceSessionId"> &
      Partial<Pick<VoiceCopilotEvent, "voiceSessionId">>,
  ): void {
    const full = {
      ...event,
      occurredAt: nowIso(),
      engine: "mock" as const,
      voiceSessionId:
        event.voiceSessionId !== undefined
          ? event.voiceSessionId
          : voiceSessionId,
    } as VoiceCopilotEvent;
    for (const listener of listeners) {
      listener(full);
    }
  }

  return {
    kind: "mock",
    capturesAudio: false,

    async start(input) {
      voiceSessionId = input.voiceSessionId;
      active = true;
      emit({
        type: "session_starting",
        payload: { voiceSessionId: input.voiceSessionId },
        voiceSessionId: input.voiceSessionId,
      });
      emit({
        type: "listening_started",
        payload: {},
      });
      if (emitInterim) {
        emit({
          type: "interim_transcript",
          payload: { text: "…" },
        });
      }
    },

    async stop() {
      if (!active) return;
      active = false;
      emit({ type: "processing_started", payload: {} });
      emit({
        type: "final_transcript",
        payload: { text: mockTranscript },
      });
      emit({
        type: "session_completed",
        payload: { transcript: mockTranscript },
      });
      voiceSessionId = null;
    },

    async cancel(reason = null) {
      if (!active && !voiceSessionId) return;
      active = false;
      emit({
        type: "session_cancelled",
        payload: { reason },
      });
      voiceSessionId = null;
    },

    onEvent(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
