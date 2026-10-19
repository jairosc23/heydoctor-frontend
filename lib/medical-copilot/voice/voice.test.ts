import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyVoiceCopilotEvent,
  canStartVoiceSession,
  createMockVoiceTransportProvider,
  createVoiceCopilotService,
  createVoiceCopilotState,
  INITIAL_VOICE_COPILOT_STATE,
  VOICE_ENGINE_KINDS,
} from "./index";

describe("applyVoiceCopilotEvent", () => {
  it("transitions idle → starting → listening → processing → completed", () => {
    let state = createVoiceCopilotState();
    state = applyVoiceCopilotEvent(state, {
      type: "session_starting",
      occurredAt: "t1",
      engine: "mock",
      voiceSessionId: "v1",
      payload: { voiceSessionId: "v1" },
    });
    assert.equal(state.phase, "starting");
    assert.equal(state.active, true);

    state = applyVoiceCopilotEvent(state, {
      type: "listening_started",
      occurredAt: "t2",
      engine: "mock",
      voiceSessionId: "v1",
      payload: {},
    });
    assert.equal(state.phase, "listening");

    state = applyVoiceCopilotEvent(state, {
      type: "interim_transcript",
      occurredAt: "t3",
      engine: "mock",
      voiceSessionId: "v1",
      payload: { text: "hola" },
    });
    assert.equal(state.interimTranscript, "hola");

    state = applyVoiceCopilotEvent(state, {
      type: "processing_started",
      occurredAt: "t4",
      engine: "mock",
      voiceSessionId: "v1",
      payload: {},
    });
    assert.equal(state.phase, "processing");

    state = applyVoiceCopilotEvent(state, {
      type: "final_transcript",
      occurredAt: "t5",
      engine: "mock",
      voiceSessionId: "v1",
      payload: { text: "hola doctor" },
    });
    state = applyVoiceCopilotEvent(state, {
      type: "session_completed",
      occurredAt: "t6",
      engine: "mock",
      voiceSessionId: "v1",
      payload: { transcript: "hola doctor" },
    });
    assert.equal(state.phase, "completed");
    assert.equal(state.active, false);
    assert.equal(state.finalTranscript, "hola doctor");
  });

  it("supports cancelled and error terminal phases", () => {
    let state = createVoiceCopilotState({ phase: "listening", active: true });
    state = applyVoiceCopilotEvent(state, {
      type: "session_cancelled",
      occurredAt: "t1",
      engine: "mock",
      voiceSessionId: "v1",
      payload: { reason: "user_abort" },
    });
    assert.equal(state.phase, "cancelled");

    state = applyVoiceCopilotEvent(state, {
      type: "session_error",
      occurredAt: "t2",
      engine: "mock",
      voiceSessionId: "v1",
      payload: { error: "boom" },
    });
    assert.equal(state.phase, "error");
    assert.equal(state.error, "boom");
  });
});

describe("createMockVoiceTransportProvider", () => {
  it("does not capture real audio", () => {
    const provider = createMockVoiceTransportProvider();
    assert.equal(provider.kind, "mock");
    assert.equal(provider.capturesAudio, false);
  });

  it("emits synthetic lifecycle events on start/stop", async () => {
    const provider = createMockVoiceTransportProvider({
      mockTranscript: "synthetic",
      emitInterim: true,
    });
    const types: string[] = [];
    provider.onEvent((event) => {
      types.push(event.type);
    });

    await provider.start({ voiceSessionId: "v-test" });
    await provider.stop();

    assert.deepEqual(types, [
      "session_starting",
      "listening_started",
      "interim_transcript",
      "processing_started",
      "final_transcript",
      "session_completed",
    ]);
  });
});

describe("VoiceCopilotService", () => {
  it("runs mock session start → stop without touching Store", async () => {
    const service = createVoiceCopilotService({
      provider: createMockVoiceTransportProvider({
        mockTranscript: "orden de labs",
      }),
    });

    assert.equal(service.getState().phase, "idle");
    assert.equal(canStartVoiceSession(service.getState().phase), true);

    await service.start();
    assert.equal(service.getState().phase, "listening");
    assert.ok(service.getState().voiceSessionId);

    await service.stop();
    assert.equal(service.getState().phase, "completed");
    assert.equal(service.getState().finalTranscript, "orden de labs");
    assert.equal(service.getState().active, false);
  });

  it("cancels an active listening session", async () => {
    const service = createVoiceCopilotService();
    await service.start();
    await service.cancel("user_cancel");
    assert.equal(service.getState().phase, "cancelled");
  });

  it("reset returns to idle preserving preferred engine", async () => {
    const service = createVoiceCopilotService({
      preferredEngine: "deepgram",
    });
    await service.start();
    await service.stop();
    service.reset();
    assert.deepEqual(
      {
        phase: service.getState().phase,
        engine: service.getState().engine,
        finalTranscript: service.getState().finalTranscript,
      },
      {
        phase: "idle",
        engine: "deepgram",
        finalTranscript: null,
      },
    );
  });

  it("setEngine records logical engine for future Speech Integration", () => {
    const service = createVoiceCopilotService();
    service.setEngine("web_speech");
    assert.equal(service.getEngine(), "web_speech");
    assert.equal(service.getState().engine, "web_speech");
    // Runtime provider remains mock until CP-28 wires a real engine.
    assert.ok(VOICE_ENGINE_KINDS.includes("openai_realtime"));
  });

  it("rejects start from listening with session_error", async () => {
    const service = createVoiceCopilotService();
    const events: string[] = [];
    service.onEvent((e) => events.push(e.type));
    await service.start();
    await service.start();
    assert.ok(events.includes("session_error"));
    assert.equal(service.getState().phase, "error");
  });

  it("starts from INITIAL idle snapshot", () => {
    assert.equal(INITIAL_VOICE_COPILOT_STATE.phase, "idle");
    assert.equal(INITIAL_VOICE_COPILOT_STATE.engine, "mock");
  });
});
