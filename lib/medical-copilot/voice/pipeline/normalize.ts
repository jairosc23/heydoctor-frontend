/**
 * CP-29 — Normalize upstream voice signals into VoicePipelineEvent.
 */

import type { VoiceCopilotEvent } from "../types";
import type { VoicePipelineEvent } from "./types";

function createEventId(): string {
  return `vpe_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function baseFromCopilot(
  event: VoiceCopilotEvent,
): Pick<
  VoicePipelineEvent,
  "eventId" | "occurredAt" | "voiceSessionId" | "engine" | "source" | "stage"
> {
  return {
    eventId: createEventId(),
    occurredAt: event.occurredAt,
    voiceSessionId: event.voiceSessionId,
    engine: event.engine,
    source: "speech_provider",
    stage: "normalize",
  };
}

/**
 * Map CP-27 VoiceCopilotEvent → zero or more pipeline events.
 * Does not persist transcripts or audio.
 */
export function normalizeVoiceCopilotEvent(
  event: VoiceCopilotEvent,
): VoicePipelineEvent[] {
  const base = baseFromCopilot(event);

  switch (event.type) {
    case "session_starting":
      return [
        {
          ...base,
          type: "session_started",
          payload: { voiceSessionId: event.payload.voiceSessionId },
        },
      ];
    case "listening_started":
      return [
        {
          ...base,
          type: "listening_started",
          payload: {},
        },
      ];
    case "interim_transcript":
      return [
        {
          ...base,
          type: "partial_transcript",
          payload: { text: event.payload.text },
        },
      ];
    case "final_transcript":
      return [
        {
          ...base,
          type: "final_transcript",
          payload: { text: event.payload.text },
        },
      ];
    case "processing_started":
    case "session_completed":
      return [
        {
          ...base,
          type: "listening_stopped",
          payload: {
            reason:
              event.type === "session_completed" ? "completed" : "processing",
          },
        },
      ];
    case "session_cancelled":
      return [
        {
          ...base,
          type: "cancelled",
          payload: { reason: event.payload.reason },
        },
      ];
    case "session_error":
      return [
        {
          ...base,
          type: "error",
          payload: { error: event.payload.error },
        },
      ];
    case "engine_changed":
      return [
        {
          ...base,
          type: "telemetry",
          payload: {
            name: "engine_changed",
            data: { engine: event.payload.engine },
          },
        },
      ];
    default: {
      const _exhaustive: never = event;
      void _exhaustive;
      return [];
    }
  }
}

export function createVoicePipelineEventId(): string {
  return createEventId();
}
