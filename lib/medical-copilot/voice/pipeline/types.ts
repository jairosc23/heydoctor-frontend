/**
 * CP-29 — Voice Pipeline Foundation types.
 * Normalize + distribute voice events. No audio/transcript persistence.
 */

import type { VoiceEngineKind } from "../types";

export type VoicePipelineStage =
  | "idle"
  | "ingest"
  | "normalize"
  | "dispatch"
  | "complete"
  | "error";

export type VoicePipelineEventType =
  | "session_started"
  | "listening_started"
  | "partial_transcript"
  | "final_transcript"
  | "listening_stopped"
  | "cancelled"
  | "error"
  | "metrics"
  | "telemetry";

export type VoicePipelineEventBase = {
  type: VoicePipelineEventType;
  /** Unique id for this pipeline event (not stored beyond fan-out). */
  eventId: string;
  occurredAt: string;
  stage: VoicePipelineStage;
  voiceSessionId: string | null;
  engine: VoiceEngineKind | null;
  source: "speech_provider" | "session_manager" | "manual" | "system";
};

export type VoicePipelineEvent =
  | (VoicePipelineEventBase & {
      type: "session_started";
      payload: { voiceSessionId: string };
    })
  | (VoicePipelineEventBase & {
      type: "listening_started";
      payload: Record<string, never>;
    })
  | (VoicePipelineEventBase & {
      type: "partial_transcript";
      payload: { text: string };
    })
  | (VoicePipelineEventBase & {
      type: "final_transcript";
      payload: { text: string };
    })
  | (VoicePipelineEventBase & {
      type: "listening_stopped";
      payload: { reason: string | null };
    })
  | (VoicePipelineEventBase & {
      type: "cancelled";
      payload: { reason: string | null };
    })
  | (VoicePipelineEventBase & {
      type: "error";
      payload: { error: string; code?: string };
    })
  | (VoicePipelineEventBase & {
      type: "metrics";
      payload: {
        name: string;
        value: number;
        unit?: string;
        tags?: Record<string, string>;
      };
    })
  | (VoicePipelineEventBase & {
      type: "telemetry";
      payload: {
        name: string;
        data?: Record<string, string | number | boolean | null>;
      };
    });

/** Ephemeral pipeline runtime status — not a transcript store. */
export type VoicePipelineStatus = {
  stage: VoicePipelineStage;
  lastEventType: VoicePipelineEventType | null;
  lastEventAt: string | null;
  observerCount: number;
  processedCount: number;
  errorCount: number;
};

export const INITIAL_VOICE_PIPELINE_STATUS: VoicePipelineStatus = {
  stage: "idle",
  lastEventType: null,
  lastEventAt: null,
  observerCount: 0,
  processedCount: 0,
  errorCount: 0,
};

export const VOICE_PIPELINE_EVENT_TYPES: readonly VoicePipelineEventType[] = [
  "session_started",
  "listening_started",
  "partial_transcript",
  "final_transcript",
  "listening_stopped",
  "cancelled",
  "error",
  "metrics",
  "telemetry",
] as const;
