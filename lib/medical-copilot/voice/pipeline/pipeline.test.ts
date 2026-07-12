import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  VOICE_PIPELINE_EVENT_TYPES,
  createVoicePipeline,
  createVoicePipelineDispatcher,
  normalizeVoiceCopilotEvent,
  type VoicePipelineEvent,
  type VoicePipelineObserver,
} from "./index";

describe("normalizeVoiceCopilotEvent", () => {
  it("maps foundation events to pipeline events without persistence", () => {
    const started = normalizeVoiceCopilotEvent({
      type: "session_starting",
      occurredAt: "t0",
      engine: "mock",
      voiceSessionId: "v1",
      payload: { voiceSessionId: "v1" },
    });
    assert.equal(started[0]?.type, "session_started");

    const partial = normalizeVoiceCopilotEvent({
      type: "interim_transcript",
      occurredAt: "t1",
      engine: "mock",
      voiceSessionId: "v1",
      payload: { text: "hola" },
    });
    assert.equal(partial[0]?.type, "partial_transcript");

    const cancelled = normalizeVoiceCopilotEvent({
      type: "session_cancelled",
      occurredAt: "t2",
      engine: "mock",
      voiceSessionId: "v1",
      payload: { reason: "user" },
    });
    assert.equal(cancelled[0]?.type, "cancelled");
  });
});

describe("VoicePipelineDispatcher", () => {
  it("fans out to matching observers only", () => {
    const dispatcher = createVoicePipelineDispatcher();
    const all: string[] = [];
    const errorsOnly: string[] = [];

    dispatcher.subscribe({
      id: "all",
      onEvent: (e) => all.push(e.type),
    });
    dispatcher.subscribe({
      id: "errors",
      types: ["error"],
      onEvent: (e) => errorsOnly.push(e.type),
    });

    const event: VoicePipelineEvent = {
      type: "partial_transcript",
      eventId: "e1",
      occurredAt: "t",
      stage: "dispatch",
      voiceSessionId: "v1",
      engine: "mock",
      source: "manual",
      payload: { text: "x" },
    };
    assert.equal(dispatcher.dispatch(event), 1);

    const err: VoicePipelineEvent = {
      type: "error",
      eventId: "e2",
      occurredAt: "t",
      stage: "dispatch",
      voiceSessionId: "v1",
      engine: "mock",
      source: "system",
      payload: { error: "boom" },
    };
    assert.equal(dispatcher.dispatch(err), 2);
    assert.deepEqual(all, ["partial_transcript", "error"]);
    assert.deepEqual(errorsOnly, ["error"]);
  });
});

describe("VoicePipeline", () => {
  it("ingests copilot events and notifies observers", () => {
    const pipeline = createVoicePipeline();
    const seen: string[] = [];

    const observer: VoicePipelineObserver = {
      id: "ui",
      onEvent: (e) => seen.push(e.type),
    };
    pipeline.subscribe(observer);

    pipeline.push({
      kind: "copilot",
      event: {
        type: "listening_started",
        occurredAt: "2026-07-11T21:00:00.000Z",
        engine: "mock",
        voiceSessionId: "v9",
        payload: {},
      },
    });

    assert.deepEqual(seen, ["listening_started"]);
    assert.equal(pipeline.getStatus().processedCount, 1);
    assert.equal(pipeline.getStage(), "complete");
  });

  it("supports all declared pipeline event types via raw ingest", () => {
    const pipeline = createVoicePipeline();
    const seen = new Set<string>();
    pipeline.subscribe({
      id: "collector",
      onEvent: (e) => seen.add(e.type),
    });

    for (const type of VOICE_PIPELINE_EVENT_TYPES) {
      const payload =
        type === "session_started"
          ? { voiceSessionId: "v1" }
          : type === "listening_started"
            ? {}
            : type === "partial_transcript" || type === "final_transcript"
              ? { text: "t" }
              : type === "listening_stopped" || type === "cancelled"
                ? { reason: null }
                : type === "error"
                  ? { error: "e" }
                  : type === "metrics"
                    ? { name: "latency_ms", value: 1 }
                    : { name: "ping", data: { ok: true } };

      pipeline.push({
        kind: "raw",
        type,
        payload: payload as never,
        source: "manual",
      });
    }

    assert.deepEqual(
      [...seen].sort(),
      [...VOICE_PIPELINE_EVENT_TYPES].sort(),
    );
  });

  it("emits metrics and telemetry without storing history", () => {
    const pipeline = createVoicePipeline();
    const names: string[] = [];
    pipeline.subscribe({
      id: "metrics",
      types: ["metrics", "telemetry"],
      onEvent: (e) => {
        if (e.type === "metrics" || e.type === "telemetry") {
          names.push(e.payload.name);
        }
      },
    });

    pipeline.emitMetrics({ name: "partial_count", value: 3, unit: "count" });
    pipeline.emitTelemetry({ name: "session_tick", data: { n: 1 } });
    pipeline.reset();

    assert.deepEqual(names, ["partial_count", "session_tick"]);
    assert.equal(pipeline.getStatus().processedCount, 0);
    assert.equal(pipeline.getStage(), "idle");
    // Observers remain subscribed after reset.
    assert.equal(pipeline.getStatus().observerCount, 1);
  });

  it("does not retain transcript payloads after dispatch", () => {
    const pipeline = createVoicePipeline();
    let lastText: string | null = null;
    pipeline.subscribe({
      id: "ephemeral",
      types: ["final_transcript"],
      onEvent: (e) => {
        if (e.type === "final_transcript") {
          lastText = e.payload.text;
        }
      },
    });

    pipeline.push({
      kind: "raw",
      type: "final_transcript",
      payload: { text: "transient" },
    });

    assert.equal(lastText, "transient");
    // Pipeline status has no transcript field / history buffer.
    assert.equal(
      "transcript" in (pipeline.getStatus() as object),
      false,
    );
  });
});
