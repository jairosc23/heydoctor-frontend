/**
 * CP-29 — Public contracts for Voice Pipeline Foundation.
 */

import type { VoiceCopilotEvent } from "../types";
import type {
  VoicePipelineEvent,
  VoicePipelineEventType,
  VoicePipelineStage,
  VoicePipelineStatus,
} from "./types";

export type VoicePipelineObserver = {
  readonly id: string;
  /** Optional filter; when omitted, receives all events. */
  readonly types?: readonly VoicePipelineEventType[];
  onEvent(event: VoicePipelineEvent): void;
};

export interface VoicePipelineDispatcher {
  subscribe(observer: VoicePipelineObserver): () => void;
  unsubscribe(observerId: string): void;
  /** Fan-out a normalized event to matching observers. */
  dispatch(event: VoicePipelineEvent): number;
  observerCount(): number;
  listObserverIds(): string[];
}

export type VoicePipelineIngestInput =
  | { kind: "pipeline"; event: VoicePipelineEvent }
  | { kind: "copilot"; event: VoiceCopilotEvent }
  | {
      kind: "raw";
      type: VoicePipelineEventType;
      payload: VoicePipelineEvent["payload"];
      voiceSessionId?: string | null;
      engine?: VoicePipelineEvent["engine"];
      source?: VoicePipelineEvent["source"];
      occurredAt?: string;
    };

export interface VoicePipeline {
  getStatus(): VoicePipelineStatus;
  getStage(): VoicePipelineStage;
  /** Register an observer (returns unsubscribe). */
  subscribe(observer: VoicePipelineObserver): () => void;
  /** Ingest + normalize + dispatch. Returns the normalized event(s). */
  push(input: VoicePipelineIngestInput): VoicePipelineEvent[];
  /** Convenience: emit metrics without storing history. */
  emitMetrics(
    payload: Extract<VoicePipelineEvent, { type: "metrics" }>["payload"],
    meta?: {
      voiceSessionId?: string | null;
      engine?: VoicePipelineEvent["engine"];
    },
  ): VoicePipelineEvent;
  /** Convenience: emit telemetry without storing history. */
  emitTelemetry(
    payload: Extract<VoicePipelineEvent, { type: "telemetry" }>["payload"],
    meta?: {
      voiceSessionId?: string | null;
      engine?: VoicePipelineEvent["engine"];
    },
  ): VoicePipelineEvent;
  /** Reset ephemeral counters/stage (does not keep event history). */
  reset(): void;
}
