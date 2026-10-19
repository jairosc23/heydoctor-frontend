/**
 * CP-29 — VoicePipeline.
 * Ingest → normalize → dispatch. No audio/transcript storage, no AI/backend.
 */

import type {
  VoicePipeline,
  VoicePipelineDispatcher,
  VoicePipelineIngestInput,
  VoicePipelineObserver,
} from "./contracts";
import { createVoicePipelineDispatcher } from "./dispatcher";
import {
  createVoicePipelineEventId,
  normalizeVoiceCopilotEvent,
} from "./normalize";
import type { VoicePipelineEvent, VoicePipelineStatus } from "./types";
import { INITIAL_VOICE_PIPELINE_STATUS } from "./types";

export type CreateVoicePipelineOptions = {
  dispatcher?: VoicePipelineDispatcher;
};

export function createVoicePipeline(
  options: CreateVoicePipelineOptions = {},
): VoicePipeline {
  const dispatcher =
    options.dispatcher ?? createVoicePipelineDispatcher();

  let status: VoicePipelineStatus = {
    ...INITIAL_VOICE_PIPELINE_STATUS,
  };

  function setStage(
    stage: VoicePipelineStatus["stage"],
    event?: VoicePipelineEvent,
  ): void {
    status = {
      ...status,
      stage,
      lastEventType: event?.type ?? status.lastEventType,
      lastEventAt: event?.occurredAt ?? status.lastEventAt,
      observerCount: dispatcher.observerCount(),
    };
  }

  function dispatchNormalized(event: VoicePipelineEvent): VoicePipelineEvent {
    const withDispatchStage: VoicePipelineEvent = {
      ...event,
      stage: "dispatch",
    };
    setStage("dispatch", withDispatchStage);
    try {
      dispatcher.dispatch(withDispatchStage);
      const completed: VoicePipelineEvent = {
        ...withDispatchStage,
        stage: "complete",
      };
      status = {
        ...status,
        stage: "complete",
        processedCount: status.processedCount + 1,
        lastEventType: completed.type,
        lastEventAt: completed.occurredAt,
        observerCount: dispatcher.observerCount(),
      };
      return completed;
    } catch {
      status = {
        ...status,
        stage: "error",
        errorCount: status.errorCount + 1,
        observerCount: dispatcher.observerCount(),
      };
      return {
        ...withDispatchStage,
        stage: "error",
      };
    }
  }

  function fromRaw(
    input: Extract<VoicePipelineIngestInput, { kind: "raw" }>,
  ): VoicePipelineEvent {
    const base = {
      eventId: createVoicePipelineEventId(),
      occurredAt: input.occurredAt ?? new Date().toISOString(),
      stage: "normalize" as const,
      voiceSessionId: input.voiceSessionId ?? null,
      engine: input.engine ?? null,
      source: input.source ?? "manual",
    };

    switch (input.type) {
      case "session_started":
        return {
          ...base,
          type: "session_started",
          payload: input.payload as { voiceSessionId: string },
        };
      case "listening_started":
        return {
          ...base,
          type: "listening_started",
          payload: {},
        };
      case "partial_transcript":
        return {
          ...base,
          type: "partial_transcript",
          payload: input.payload as { text: string },
        };
      case "final_transcript":
        return {
          ...base,
          type: "final_transcript",
          payload: input.payload as { text: string },
        };
      case "listening_stopped":
        return {
          ...base,
          type: "listening_stopped",
          payload: input.payload as { reason: string | null },
        };
      case "cancelled":
        return {
          ...base,
          type: "cancelled",
          payload: input.payload as { reason: string | null },
        };
      case "error":
        return {
          ...base,
          type: "error",
          payload: input.payload as { error: string; code?: string },
        };
      case "metrics":
        return {
          ...base,
          type: "metrics",
          payload: input.payload as Extract<
            VoicePipelineEvent,
            { type: "metrics" }
          >["payload"],
        };
      case "telemetry":
        return {
          ...base,
          type: "telemetry",
          payload: input.payload as Extract<
            VoicePipelineEvent,
            { type: "telemetry" }
          >["payload"],
        };
      default: {
        const _exhaustive: never = input.type;
        void _exhaustive;
        return {
          ...base,
          type: "error",
          payload: { error: "unknown_raw_pipeline_event" },
        };
      }
    }
  }

  const pipeline: VoicePipeline = {
    getStatus() {
      return {
        ...status,
        observerCount: dispatcher.observerCount(),
      };
    },

    getStage() {
      return status.stage;
    },

    subscribe(observer: VoicePipelineObserver) {
      const unsubscribe = dispatcher.subscribe(observer);
      status = {
        ...status,
        observerCount: dispatcher.observerCount(),
      };
      return () => {
        unsubscribe();
        status = {
          ...status,
          observerCount: dispatcher.observerCount(),
        };
      };
    },

    push(input: VoicePipelineIngestInput): VoicePipelineEvent[] {
      setStage("ingest");
      setStage("normalize");

      let normalized: VoicePipelineEvent[] = [];
      switch (input.kind) {
        case "pipeline":
          normalized = [{ ...input.event, stage: "normalize" }];
          break;
        case "copilot":
          normalized = normalizeVoiceCopilotEvent(input.event);
          break;
        case "raw":
          normalized = [fromRaw(input)];
          break;
        default: {
          const _exhaustive: never = input;
          void _exhaustive;
          normalized = [];
        }
      }

      return normalized.map((event) => dispatchNormalized(event));
    },

    emitMetrics(payload, meta) {
      const [event] = pipeline.push({
        kind: "raw",
        type: "metrics",
        payload,
        voiceSessionId: meta?.voiceSessionId,
        engine: meta?.engine,
        source: "system",
      });
      return event!;
    },

    emitTelemetry(payload, meta) {
      const [event] = pipeline.push({
        kind: "raw",
        type: "telemetry",
        payload,
        voiceSessionId: meta?.voiceSessionId,
        engine: meta?.engine,
        source: "system",
      });
      return event!;
    },

    reset() {
      status = {
        ...INITIAL_VOICE_PIPELINE_STATUS,
        observerCount: dispatcher.observerCount(),
      };
    },
  };

  return pipeline;
}
