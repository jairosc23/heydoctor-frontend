import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createMockVoiceTransportProvider } from "../mock-provider";
import {
  applyVoiceSessionEvent,
  canPauseVoiceSession,
  createVoiceSessionManager,
  createVoiceSessionManagerState,
  type VoiceSessionClock,
  type VoiceSessionTimerHandle,
} from "./index";

function createFakeClock(options?: {
  onTimeoutArmed?: (ms: number) => void;
}): {
  clock: VoiceSessionClock;
  fireTimeout: () => void;
} {
  let pending: { fn: () => void; ms: number } | null = null;
  let handleId = 1;
  const clock: VoiceSessionClock = {
    now: () => "2026-07-11T20:00:00.000Z",
    setTimeout: (fn, ms) => {
      pending = { fn, ms };
      options?.onTimeoutArmed?.(ms);
      return { id: handleId++ };
    },
    clearTimeout: (_handle: VoiceSessionTimerHandle) => {
      pending = null;
    },
  };
  return {
    clock,
    fireTimeout: () => {
      const job = pending;
      pending = null;
      job?.fn();
    },
  };
}

describe("applyVoiceSessionEvent", () => {
  it("applies create → start → pause → resume → complete path", () => {
    let state = createVoiceSessionManagerState();
    state = applyVoiceSessionEvent(state, {
      type: "session_created",
      occurredAt: "t0",
      sessionId: "s1",
      engine: "mock",
      payload: {
        session: {
          sessionId: "s1",
          engine: "mock",
          phase: "created",
          permissionStatus: "unknown",
          createdAt: "t0",
          startedAt: null,
          pausedAt: null,
          endedAt: null,
          pauseCount: 0,
          lastError: null,
          interimTranscript: null,
          finalTranscript: null,
          timeoutMs: null,
        },
      },
    });
    assert.equal(state.phase, "created");

    state = applyVoiceSessionEvent(state, {
      type: "session_starting",
      occurredAt: "t1",
      sessionId: "s1",
      engine: "mock",
      payload: { sessionId: "s1" },
    });
    state = applyVoiceSessionEvent(state, {
      type: "session_started",
      occurredAt: "t2",
      sessionId: "s1",
      engine: "mock",
      payload: { sessionId: "s1" },
    });
    assert.equal(state.phase, "listening");
    assert.equal(canPauseVoiceSession(state.phase), true);

    state = applyVoiceSessionEvent(state, {
      type: "session_paused",
      occurredAt: "t3",
      sessionId: "s1",
      engine: "mock",
      payload: { sessionId: "s1", pauseCount: 1 },
    });
    assert.equal(state.phase, "paused");
    assert.equal(state.session?.pauseCount, 1);

    state = applyVoiceSessionEvent(state, {
      type: "session_resuming",
      occurredAt: "t4",
      sessionId: "s1",
      engine: "mock",
      payload: { sessionId: "s1" },
    });
    state = applyVoiceSessionEvent(state, {
      type: "session_resumed",
      occurredAt: "t5",
      sessionId: "s1",
      engine: "mock",
      payload: { sessionId: "s1" },
    });
    assert.equal(state.phase, "listening");
  });
});

describe("VoiceSessionManager", () => {
  it("creates, starts, completes a session with mock transport", async () => {
    const manager = createVoiceSessionManager({
      transport: createMockVoiceTransportProvider({
        mockTranscript: "session transcript",
      }),
    });

    const created = manager.createSession();
    assert.ok(created);
    assert.equal(manager.getState().phase, "created");

    await manager.start();
    assert.equal(manager.getState().phase, "listening");
    assert.equal(manager.getState().active, true);

    await manager.complete();
    assert.equal(manager.getState().phase, "completed");
    assert.equal(manager.getSession()?.finalTranscript, "session transcript");
    assert.equal(manager.getState().active, false);
  });

  it("pauses and resumes without capturing audio", async () => {
    const manager = createVoiceSessionManager();
    manager.createSession();
    await manager.start();
    await manager.pause();
    assert.equal(manager.getState().phase, "paused");
    assert.equal(manager.getSession()?.pauseCount, 1);

    await manager.resume();
    assert.equal(manager.getState().phase, "listening");
    assert.equal(manager.getTransport()?.capturesAudio, false);
  });

  it("cancels an active session", async () => {
    const manager = createVoiceSessionManager();
    manager.createSession();
    await manager.start();
    await manager.cancel("user_abort");
    assert.equal(manager.getState().phase, "cancelled");
  });

  it("times out while listening using injected clock", async () => {
    const { clock, fireTimeout } = createFakeClock();
    const manager = createVoiceSessionManager({
      clock,
      timeoutMs: 1000,
      transport: createMockVoiceTransportProvider(),
    });

    manager.createSession({ timeoutMs: 1000 });
    await manager.start();
    assert.equal(manager.getState().phase, "listening");

    fireTimeout();
    assert.equal(manager.getState().phase, "timed_out");
    assert.ok(manager.getSession()?.lastError?.includes("timed_out"));
  });

  it("recovers from timed_out back to created", async () => {
    const { clock, fireTimeout } = createFakeClock();
    const manager = createVoiceSessionManager({
      clock,
      timeoutMs: 500,
    });
    manager.createSession();
    await manager.start();
    fireTimeout();
    assert.equal(manager.getState().phase, "timed_out");

    await manager.recover();
    assert.equal(manager.getState().phase, "created");
    assert.equal(manager.getSession()?.lastError, null);
  });

  it("tracks logical permission status without prompting", () => {
    const manager = createVoiceSessionManager({ useMockTransport: false });
    assert.equal(manager.getState().permissionStatus, "unknown");
    manager.setPermissionStatus("granted");
    assert.equal(manager.getState().permissionStatus, "granted");
    manager.setPermissionStatus("denied");
    assert.equal(manager.getState().permissionStatus, "denied");
  });

  it("changes logical engine for future Speech Provider Integration", () => {
    const manager = createVoiceSessionManager();
    manager.setEngine("deepgram");
    assert.equal(manager.getState().engine, "deepgram");
    const session = manager.createSession();
    assert.equal(session?.engine, "deepgram");
  });

  it("rejects start before create", async () => {
    const manager = createVoiceSessionManager();
    const events: string[] = [];
    manager.onEvent((e) => events.push(e.type));
    await manager.start();
    assert.ok(events.includes("session_error"));
    assert.equal(manager.getState().phase, "error");
  });
});
